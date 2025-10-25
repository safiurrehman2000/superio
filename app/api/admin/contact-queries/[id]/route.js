import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { adminDb } from "@/utils/firebase-admin";

/**
 * PUT /api/admin/contact-queries/[id]
 * Update a contact query status (mark as resolved)
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can update contact query status
 */
export async function PUT(request, { params }) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    const { id } = params;

    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) updating contact query ${id}`
    );

    const { status } = await request.json();

    // Validate status
    if (!status || !["pending", "resolved"].includes(status)) {
      return Response.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if query exists
    const queryRef = adminDb.collection("contactQueries").doc(id);
    const queryDoc = await queryRef.get();

    if (!queryDoc.exists) {
      return Response.json(
        { success: false, error: "Contact query not found" },
        { status: 404 }
      );
    }

    // Update the query
    const updateData = {
      status: status,
    };

    // If marking as resolved, add resolution details
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = adminUser.uid;
      updateData.resolvedByEmail = adminUser.email;
    } else if (status === "pending") {
      // If marking as pending again, clear resolution details
      updateData.resolvedAt = null;
      updateData.resolvedBy = null;
      updateData.resolvedByEmail = null;
    }

    await queryRef.update(updateData);

    console.log(
      `✅ Admin ${adminUser.email} successfully updated contact query ${id} to ${status}`
    );

    return Response.json({
      success: true,
      message: "Contact query status updated successfully",
    });
  } catch (error) {
    console.error("Error updating contact query:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while updating contact query",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/contact-queries/[id]
 * Delete a contact query
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can delete contact queries
 */
export async function DELETE(request, { params }) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    const { id } = params;

    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) deleting contact query ${id}`
    );

    // Check if query exists
    const queryRef = adminDb.collection("contactQueries").doc(id);
    const queryDoc = await queryRef.get();

    if (!queryDoc.exists) {
      return Response.json(
        { success: false, error: "Contact query not found" },
        { status: 404 }
      );
    }

    // Delete the query
    await queryRef.delete();

    console.log(
      `✅ Admin ${adminUser.email} successfully deleted contact query ${id}`
    );

    return Response.json({
      success: true,
      message: "Contact query deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact query:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while deleting contact query",
      },
      { status: 500 }
    );
  }
}
