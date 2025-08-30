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

    return Response.json({
      success: true,
      message: "User updated successfully",
      updatedFields: Object.keys(filteredUpdateData),
      userId: userId,
    });
  } catch (error) {
    console.error("Error in admin user update:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during update",
      },
      { status: 500 }
    );
  }
}
