import { adminDb } from "@/utils/firebase-admin";
import admin from "firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { sanitizeFormData } from "@/utils/sanitization";

/**
 * POST /api/admin/create-admin
 * Creates a new admin user account
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can create new admin accounts
 * Security: Multiple layers of validation and audit logging
 */
export async function POST(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to create new admin account`
    );

    const { email, password, name, phone } = await request.json();

    // Validate required fields
    if (!email || !password || !name) {
      return Response.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists in Firebase Auth
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        return Response.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error) {
      // User doesn't exist, which is what we want
      if (error.code !== "auth/user-not-found") {
        console.error("Error checking existing user:", error);
        return Response.json(
          { success: false, error: "Error checking user existence" },
          { status: 500 }
        );
      }
    }

    // Check if user already exists in Firestore
    const userQuery = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      return Response.json(
        {
          success: false,
          error: "User with this email already exists in database",
        },
        { status: 409 }
      );
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
        phoneNumber: phone || null,
      });
    } catch (authError) {
      console.error("Firebase Auth creation failed:", authError);
      return Response.json(
        { success: false, error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Prepare user data for Firestore
    const userData = {
      email: email,
      userType: "Admin",
      name: name,
      phone: phone || null,
      createdAt: new Date(),
      createdBy: adminUser.uid,
      createdByEmail: adminUser.email,
      isFirstTime: false,
      lastUpdatedBy: adminUser.uid,
      lastUpdatedAt: new Date(),
    };

    // Sanitize the data
    const fieldTypes = {
      name: "name",
      phone: "phone",
    };

    const sanitizedUserData = sanitizeFormData(userData, fieldTypes);

    // Create user document in Firestore
    try {
      await adminDb
        .collection("users")
        .doc(firebaseUser.uid)
        .set(sanitizedUserData);
    } catch (firestoreError) {
      console.error("Firestore creation failed:", firestoreError);

      // Clean up Firebase Auth user if Firestore fails
      try {
        await admin.auth().deleteUser(firebaseUser.uid);
      } catch (cleanupError) {
        console.error("Failed to cleanup Firebase Auth user:", cleanupError);
      }

      return Response.json(
        { success: false, error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Log the admin creation for audit purposes
    console.log(
      `✅ Admin ${adminUser.email} (${adminUser.uid}) successfully created new admin: ${email} (${firebaseUser.uid})`
    );

    // Create audit log entry
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "create_admin",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetUserId: firebaseUser.uid,
        targetUserEmail: email,
        timestamp: new Date(),
        details: {
          name: name,
          phone: phone || null,
        },
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        uid: firebaseUser.uid,
        email: email,
        name: name,
        userType: "Admin",
      },
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    return Response.json(
      { success: false, error: "Internal server error during admin creation" },
      { status: 500 }
    );
  }
}
