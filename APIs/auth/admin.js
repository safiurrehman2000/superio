/**
 * Admin functions for user management
 * These functions are used by admin users to manage other users
 */

import { errorToast, successToast } from "@/utils/toast";

/**
 * Delete a user completely (Firebase Auth + Firestore data)
 * This function calls the server-side API that uses Firebase Admin SDK
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteUserCompletelyByAdmin = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Initiating complete deletion for user: ${userId}`);

    const response = await fetch(`/api/admin/delete-user?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to delete user");
    }

    console.log("✅ User deletion completed:", result);
    successToast("User and Firebase account deleted successfully");

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error deleting user completely:", error);
    errorToast(`Failed to delete user: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Update user data by admin
 * @param {string} userId - The ID of the user to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserByAdminAPI = async (userId, updateData) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("Update data is required");
    }

    const response = await fetch("/api/admin/update-user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        updateData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to update user");
    }

    successToast("User updated successfully");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating user:", error);
    errorToast(`Failed to update user: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  deleteUserCompletelyByAdmin,
  updateUserByAdminAPI,
};
