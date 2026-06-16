import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { adminDb } from "@/utils/firebase-admin";
import {
  isFirestoreQuotaError,
  quotaExceededResponse,
} from "@/utils/firestore-errors";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * GET /api/admin/contact-queries
 * Lists contact queries with pagination (newest first).
 */
export async function GET(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10), 1),
      MAX_LIMIT,
    );
    const status = (searchParams.get("status") || "").trim().toLowerCase();

    const fetchLimit = Math.min(limit * page + 1, MAX_LIMIT * 3);
    const snapshot = await adminDb
      .collection("contactQueries")
      .orderBy("createdAt", "desc")
      .limit(fetchLimit)
      .get();

    let queries = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      subject: doc.data().subject,
      message: doc.data().message,
      status: doc.data().status,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      resolvedAt: doc.data().resolvedAt?.toDate?.() || doc.data().resolvedAt,
      resolvedBy: doc.data().resolvedBy,
    }));

    if (status && status !== "all") {
      queries = queries.filter(
        (q) => String(q.status || "").toLowerCase() === status,
      );
    }

    const total = queries.length;
    const offset = (page - 1) * limit;
    const pagedQueries = queries.slice(offset, offset + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return Response.json({
      success: true,
      queries: pagedQueries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    console.error("Error fetching contact queries:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while fetching contact queries",
      },
      { status: 500 },
    );
  }
}
