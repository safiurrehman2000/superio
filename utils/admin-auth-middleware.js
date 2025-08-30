import { adminDb } from "@/utils/firebase-admin";
import admin from "firebase-admin";

/**
 * Middleware to authenticate and authorize admin users
 * @param {Request} request - The incoming request
 * @returns {Promise<{success: boolean, user?: any, error?: string, status?: number}>}
 */
export async function authenticateAdmin(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return {
        success: false,
        error: "Authorization header is required",
        status: 401,
      };
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Invalid authorization header format. Use Bearer token",
        status: 401,
      };
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return {
        success: false,
        error: "Token is required",
        status: 401,
      };
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return {
        success: false,
        error: "Invalid or expired token",
        status: 401,
      };
    }

    // Get user data from Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found in database",
        status: 404,
      };
    }

    const userData = userDoc.data();

    // Check if user is an admin
    if (userData.userType !== "Admin") {
      return {
        success: false,
        error: "Access denied. Admin privileges required",
        status: 403,
      };
    }

    // Return success with user data
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        userType: userData.userType,
        ...userData,
      },
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return {
      success: false,
      error: "Internal server error during authentication",
      status: 500,
    };
  }
}

/**
 * Helper function to create a Response object for authentication errors
 * @param {Object} authResult - Result from authenticateAdmin
 * @returns {Response}
 */
export function createAuthErrorResponse(authResult) {
  return Response.json(
    {
      success: false,
      error: authResult.error,
    },
    { status: authResult.status || 401 }
  );
}
