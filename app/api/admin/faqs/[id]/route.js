import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { sanitizeFormData } from "@/utils/sanitization";

/**
 * PUT /api/admin/faqs/[id]
 * Updates a specific FAQ
 *
 * DELETE /api/admin/faqs/[id]
 * Deletes a specific FAQ
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can manage FAQs
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to update FAQ: ${id}`
    );

    const { heading, content, category } = await request.json();

    // Validate required fields
    if (!heading || !heading.trim()) {
      return Response.json(
        { success: false, error: "FAQ heading is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return Response.json(
        { success: false, error: "FAQ content is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { success: false, error: "FAQ category is required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryRef = adminDb.collection("categories").doc(category);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      return Response.json(
        { success: false, error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    // Basic sanitization - remove HTML tags and trim
    const sanitizedHeading = heading.trim().replace(/<[^>]*>/g, "");
    const sanitizedContent = content.trim().replace(/<[^>]*>/g, "");

    if (!sanitizedHeading) {
      return Response.json(
        {
          success: false,
          error: "FAQ heading cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    if (!sanitizedContent) {
      return Response.json(
        {
          success: false,
          error: "FAQ content cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    // Add metadata
    const updateData = {
      heading: sanitizedHeading,
      content: sanitizedContent,
      category: category,
      updatedAt: new Date(),
      lastUpdatedBy: adminUser.uid,
      lastUpdatedAt: new Date(),
    };

    // Check if FAQ exists
    const faqRef = adminDb.collection("faqs").doc(id);
    const faqSnap = await faqRef.get();

    if (!faqSnap.exists) {
      return Response.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Update FAQ document in Firestore
    await faqRef.update(updateData);

    // Get the updated FAQ
    const updatedFaq = await faqRef.get();

    console.log(
      `✅ Admin ${adminUser.email} successfully updated FAQ: ${heading}`
    );

    // Create audit log entry
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "update_faq",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetId: id,
        targetType: "FAQ",
        timestamp: new Date(),
        changes: updateData,
        previousData: faqSnap.data(),
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "FAQ updated successfully",
      faq: {
        id: id,
        ...updatedFaq.data(),
        createdAt:
          updatedFaq.data().createdAt?.toDate?.() ||
          updatedFaq.data().createdAt,
        updatedAt:
          updatedFaq.data().updatedAt?.toDate?.() ||
          updatedFaq.data().updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return Response.json(
      { success: false, error: "Internal server error while updating FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    console.log("🗑️ DELETE request received for FAQ ID:", id);
    console.log("🔍 Params object:", params);
    console.log("🔍 ID type:", typeof id);
    console.log("🔍 ID value:", id);

    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to delete FAQ: ${id}`
    );

    // Check if FAQ exists
    const faqRef = adminDb.collection("faqs").doc(id);
    console.log("🔍 FAQ reference path:", faqRef.path);

    const faqSnap = await faqRef.get();
    console.log("🔍 FAQ snapshot exists:", faqSnap.exists);
    console.log("🔍 FAQ snapshot data:", faqSnap.data());

    if (!faqSnap.exists) {
      console.log("❌ FAQ not found in database for ID:", id);
      return Response.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Get FAQ data for audit log
    const faqData = faqSnap.data();

    // Delete FAQ document from Firestore
    await faqRef.delete();

    console.log(
      `✅ Admin ${adminUser.email} successfully deleted FAQ: ${faqData.heading}`
    );

    // Create audit log entry
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "delete_faq",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetId: id,
        targetType: "FAQ",
        timestamp: new Date(),
        deletedData: faqData,
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return Response.json(
      { success: false, error: "Internal server error while deleting FAQ" },
      { status: 500 }
    );
  }
}
