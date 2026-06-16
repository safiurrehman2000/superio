import admin from "firebase-admin";
import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import {
  isFirestoreQuotaError,
  quotaExceededResponse,
} from "@/utils/firestore-errors";

const SCAN_LIMIT = 250;
const DEFAULT_RESULT_LIMIT = 20;
const MAX_RESULT_LIMIT = 30;

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
  return new Date(value).getTime() || 0;
}

export async function GET(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const limitParam = Number.parseInt(
      searchParams.get("limit") || String(DEFAULT_RESULT_LIMIT),
      10,
    );
    const resultLimit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), MAX_RESULT_LIMIT)
      : DEFAULT_RESULT_LIMIT;

    const userType = (searchParams.get("userType") || "").trim();

    if (q.length < 2) {
      return Response.json({ success: true, data: [] });
    }

    let queryRef = adminDb.collection("users");
    if (userType) {
      queryRef = queryRef.where("userType", "==", userType);
    }

    const snapshot = await queryRef
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(SCAN_LIMIT)
      .get();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || "",
          name: data.name || "",
          company_name: data.company_name || "",
          userType: data.userType || "",
          createdAt: data.createdAt,
        };
      })
      .filter((user) => {
        const haystack = [
          user.email,
          user.name,
          user.company_name,
          user.userType,
          user.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, resultLimit);

    return Response.json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    console.error("Error searching admin users:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to search users",
      },
      { status: 500 },
    );
  }
}
