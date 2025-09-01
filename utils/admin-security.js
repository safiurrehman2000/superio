/**
 * Admin Security Utilities
 * Comprehensive security measures to prevent unauthorized admin access
 */

import { adminDb } from "./firebase-admin";
import admin from "firebase-admin";

/**
 * Check if a user can be promoted to admin
 * Only existing admins can promote users to admin
 */
export async function canPromoteToAdmin(adminUserId, targetUserId) {
  try {
    // Check if the promoter is actually an admin
    const adminDoc = await adminDb.collection("users").doc(adminUserId).get();
    if (!adminDoc.exists || adminDoc.data().userType !== "Admin") {
      return { allowed: false, reason: "Promoter is not an admin" };
    }

    // Check if target user exists
    const targetDoc = await adminDb.collection("users").doc(targetUserId).get();
    if (!targetDoc.exists) {
      return { allowed: false, reason: "Target user does not exist" };
    }

    // Check if target user is already an admin
    if (targetDoc.data().userType === "Admin") {
      return { allowed: false, reason: "Target user is already an admin" };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking admin promotion permission:", error);
    return { allowed: false, reason: "Error checking permissions" };
  }
}

/**
 * Validate admin creation request
 * Ensures only legitimate admins can create new admin accounts
 */
export async function validateAdminCreation(adminUserId, requestData) {
  try {
    // Check if the creator is actually an admin
    const adminDoc = await adminDb.collection("users").doc(adminUserId).get();
    if (!adminDoc.exists || adminDoc.data().userType !== "Admin") {
      return { valid: false, reason: "Creator is not an admin" };
    }

    // Validate required fields
    if (!requestData.email || !requestData.password || !requestData.name) {
      return { valid: false, reason: "Missing required fields" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return { valid: false, reason: "Invalid email format" };
    }

    // Validate password strength
    if (requestData.password.length < 8) {
      return { valid: false, reason: "Password too weak" };
    }

    // Check if email already exists
    const existingUser = await adminDb
      .collection("users")
      .where("email", "==", requestData.email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return { valid: false, reason: "Email already exists" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating admin creation:", error);
    return { valid: false, reason: "Validation error" };
  }
}

/**
 * Log admin security events for audit purposes
 */
export async function logAdminSecurityEvent(eventData) {
  try {
    await adminDb.collection("adminSecurityLogs").add({
      ...eventData,
      timestamp: new Date(),
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log admin security event:", error);
  }
}

/**
 * Check for suspicious admin-related activities
 */
export async function detectSuspiciousAdminActivity(userId, action) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return { suspicious: true, reason: "User does not exist" };
    }

    const userData = userDoc.data();

    // Check if non-admin user is trying to perform admin actions
    if (userData.userType !== "Admin" && action.includes("admin")) {
      return {
        suspicious: true,
        reason: "Non-admin user attempting admin action",
      };
    }

    // Check for rapid admin creation attempts
    if (action === "create_admin") {
      const recentCreations = await adminDb
        .collection("adminAuditLogs")
        .where("adminUserId", "==", userId)
        .where("action", "==", "create_admin")
        .where("timestamp", ">", new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        .get();

      if (recentCreations.size > 5) {
        return {
          suspicious: true,
          reason: "Too many admin creations in 24 hours",
        };
      }
    }

    return { suspicious: false };
  } catch (error) {
    console.error("Error detecting suspicious activity:", error);
    return { suspicious: true, reason: "Error checking activity" };
  }
}

/**
 * Get admin audit trail for security monitoring
 */
export async function getAdminAuditTrail(adminUserId, limit = 100) {
  try {
    const auditLogs = await adminDb
      .collection("adminAuditLogs")
      .where("adminUserId", "==", adminUserId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return auditLogs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
    }));
  } catch (error) {
    console.error("Error getting admin audit trail:", error);
    return [];
  }
}

/**
 * Validate admin session and permissions
 */
export async function validateAdminSession(adminUserId) {
  try {
    const adminDoc = await adminDb.collection("users").doc(adminUserId).get();

    if (!adminDoc.exists) {
      return { valid: false, reason: "Admin user not found" };
    }

    const adminData = adminDoc.data();

    if (adminData.userType !== "Admin") {
      return { valid: false, reason: "User is not an admin" };
    }

    // Check if admin account is active
    if (adminData.disabled === true) {
      return { valid: false, reason: "Admin account is disabled" };
    }

    // Check last activity (optional security measure)
    const lastActivity = adminData.lastActivity || adminData.lastUpdatedAt;
    if (lastActivity) {
      const daysSinceLastActivity =
        (Date.now() - lastActivity.toDate()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity > 90) {
        return { valid: false, reason: "Admin account inactive for too long" };
      }
    }

    return { valid: true, adminData };
  } catch (error) {
    console.error("Error validating admin session:", error);
    return { valid: false, reason: "Session validation error" };
  }
}

/**
 * Rate limit admin operations to prevent abuse
 */
export async function checkAdminRateLimit(
  adminUserId,
  operation,
  maxOperations = 10,
  windowMs = 60000
) {
  try {
    const now = Date.now();
    const windowStart = now - windowMs;

    const recentOperations = await adminDb
      .collection("adminRateLimits")
      .where("adminUserId", "==", adminUserId)
      .where("operation", "==", operation)
      .where("timestamp", ">", new Date(windowStart))
      .get();

    if (recentOperations.size >= maxOperations) {
      return { allowed: false, reason: "Rate limit exceeded" };
    }

    // Log this operation
    await adminDb.collection("adminRateLimits").add({
      adminUserId,
      operation,
      timestamp: new Date(),
    });

    return { allowed: true };
  } catch (error) {
    console.error("Error checking admin rate limit:", error);
    return { allowed: true }; // Fail open for rate limiting
  }
}
