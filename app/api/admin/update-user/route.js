import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { sanitizeFormData } from "@/utils/sanitization";

/**
 * PUT /api/admin/update-user
 * Updates user data by admin
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can update other users
 * Security: Prevents unauthorized admin creation and role escalation
 */
export async function PUT(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to update user`
    );

    const { userId, updateData } = await request.json();

    // Validate required fields
    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return Response.json(
        { success: false, error: "Update data is required" },
        { status: 400 }
      );
    }

    // Prevent admin from updating themselves through this endpoint
    if (userId === adminUser.uid) {
      return Response.json(
        {
          success: false,
          error: "Cannot update your own account through admin endpoint",
        },
        { status: 400 }
      );
    }

    // Check if the user exists
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    const currentUserType = userData.userType;

    // SECURITY: Prevent unauthorized admin creation
    if (updateData.userType === "Admin") {
      // Only allow changing to admin if the user is already an admin
      if (currentUserType !== "Admin") {
        console.warn(
          `🚨 SECURITY ALERT: Admin ${adminUser.email} attempted to escalate user ${userId} to admin role`
        );
        return Response.json(
          {
            success: false,
            error:
              "Cannot change user type to Admin through this endpoint. Use the create-admin endpoint instead.",
          },
          { status: 403 }
        );
      }
    }

    // Define allowed fields that can be updated by admin
    const allowedFields = [
      "name",
      "title",
      "phone_number",
      "phone",
      "gender",
      "age",
      "description",
      "company_name",
      "website",
      "company_type",
      "company_location",
      "logo",
      "isFirstTime",
      "hasPostedJob",
      "subscriptionStatus",
      "planId",
      "stripeCustomerId",
      "stripeSubscriptionId",
      "subscriptionUpdatedAt",
      "subscriptionStartDate",
      "hasUsedTrial",
    ];

    // Filter updateData to only include allowed fields
    const filteredUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = value;
      } else {
        console.warn(
          `Admin ${adminUser.email} attempted to update restricted field: ${key}`
        );
      }
    }

    // Sanitize the filtered data
    const fieldTypes = {
      name: "name",
      title: "title",
      phone_number: "phone",
      phone: "phone",
      gender: "gender",
      age: "age",
      description: "description",
      company_name: "name",
      website: "url",
      company_type: "company_type",
      company_location: "text",
    };

    const sanitizedUpdateData = sanitizeFormData(
      filteredUpdateData,
      fieldTypes
    );

    if (Object.keys(sanitizedUpdateData).length === 0) {
      return Response.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add audit trail
    sanitizedUpdateData.lastUpdatedBy = adminUser.uid;
    sanitizedUpdateData.lastUpdatedAt = new Date();

    // Update the user document
    await userRef.update(sanitizedUpdateData);

    console.log(
      `✅ Admin ${adminUser.email} successfully updated user ${userId}`
    );

    // Create audit log entry for the update
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "update_user",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetUserId: userId,
        targetUserEmail: userData.email,
        targetUserType: currentUserType,
        timestamp: new Date(),
        changes: sanitizedUpdateData,
        previousData: userData,
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "User updated successfully",
      updatedFields: Object.keys(sanitizedUpdateData),
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return Response.json(
      { success: false, error: "Internal server error during user update" },
      { status: 500 }
    );
  }
}
