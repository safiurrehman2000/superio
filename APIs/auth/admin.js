/**
 * Admin functions for user management
 * These functions are used by admin users to manage other users
 */

import { errorToast, successToast } from "@/utils/toast";
import { getAuthenticatedHeaders } from "@/utils/auth-utils";

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

    // Get authenticated headers
    const headers = await getAuthenticatedHeaders();

    console.log(`Initiating complete deletion for user: ${userId}`);

    const response = await fetch(`/api/admin/delete-user?userId=${userId}`, {
      method: "DELETE",
      headers,
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

    // Get authenticated headers
    const headers = await getAuthenticatedHeaders();

    const response = await fetch("/api/admin/update-user", {
      method: "PUT",
      headers,
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

/**
 * List users with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of users per page (default: 10, max: 50)
 * @param {string} options.userType - Filter by user type (Candidate, Employer, Admin)
 * @param {string} options.search - Search by email or name
 * @param {string} options.status - Filter by subscription status
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const listUsersByAdmin = async (options = {}) => {
  try {
    // Get authenticated headers
    const headers = await getAuthenticatedHeaders();

    // Build query string
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);
    if (options.userType) params.append("userType", options.userType);
    if (options.search) params.append("search", options.search);
    if (options.status) params.append("status", options.status);

    const queryString = params.toString();
    const url = `/api/admin/list-users${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to list users");
    }

    console.log("✅ Users list retrieved successfully");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error listing users:", error);
    errorToast(`Failed to list users: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  deleteUserCompletelyByAdmin,
  updateUserByAdminAPI,
  listUsersByAdmin,
};
