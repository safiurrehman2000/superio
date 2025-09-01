import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { adminDb } from "@/utils/firebase-admin";

/**
 * DELETE /api/admin/categories/[id]
 * Deletes a specific category
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can delete categories
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to delete category: ${id}`
    );

    // Check if category exists
    const categoryRef = adminDb.collection("categories").doc(id);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      return Response.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Get category data for audit log
    const categoryData = categorySnap.data();

    // Check if there are FAQs using this category
    const faqsSnapshot = await adminDb
      .collection("faqs")
      .where("category", "==", id)
      .get();

    if (!faqsSnapshot.empty) {
      return Response.json(
        {
          success: false,
          error:
            "Cannot delete category. There are FAQs using this category. Please reassign or delete those FAQs first.",
        },
        { status: 400 }
      );
    }

    // Delete category document from Firestore
    await categoryRef.delete();

    console.log(
      `✅ Admin ${adminUser.email} successfully deleted category: ${categoryData.name}`
    );

    // Create audit log entry
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "delete_category",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetId: id,
        targetType: "Category",
        timestamp: new Date(),
        deletedData: categoryData,
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while deleting category",
      },
      { status: 500 }
    );
  }
}
