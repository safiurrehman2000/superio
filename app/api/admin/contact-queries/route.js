import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { adminDb } from "@/utils/firebase-admin";

/**
 * GET /api/admin/contact-queries
 * Lists all contact queries
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can view contact queries
 */
export async function GET(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) requesting contact queries list`
    );

    // Get all contact queries from Firestore, ordered by creation date (newest first)
    const queriesSnapshot = await adminDb
      .collection("contactQueries")
      .orderBy("createdAt", "desc")
      .get();

    const queries = [];
    queriesSnapshot.forEach((doc) => {
      queries.push({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        subject: doc.data().subject,
        message: doc.data().message,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        resolvedAt: doc.data().resolvedAt?.toDate?.() || doc.data().resolvedAt,
        resolvedBy: doc.data().resolvedBy,
      });
    });

    return Response.json({
      success: true,
      queries: queries,
    });
  } catch (error) {
    console.error("Error fetching contact queries:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while fetching contact queries",
      },
      { status: 500 }
    );
  }
}
