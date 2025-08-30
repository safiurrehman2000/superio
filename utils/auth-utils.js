import { auth } from "@/utils/firebase";

/**
 * Get the current user's ID token for API authentication
 * @returns {Promise<string>} The ID token
 * @throws {Error} If user is not authenticated
 */
export async function getCurrentUserToken() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No authenticated user found. Please log in.");
  }

  try {
    const token = await currentUser.getIdToken(true); // Force refresh
    return token;
  } catch (error) {
    console.error("Error getting ID token:", error);
    throw new Error("Failed to get authentication token. Please log in again.");
  }
}

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} True if user is admin, false otherwise
 */
export async function isCurrentUserAdmin() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }

    // Get user data from Firestore
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/utils/firebase");

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    return userData.userType === "Admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get authenticated headers for API requests
 * @returns {Promise<Object>} Headers object with Authorization
 */
export async function getAuthenticatedHeaders() {
  const token = await getCurrentUserToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
