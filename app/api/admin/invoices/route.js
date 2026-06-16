import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import {
  isFirestoreQuotaError,
  quotaExceededResponse,
} from "@/utils/firestore-errors";

const BATCH_SIZE = 100;

async function batchGetUsers(userIds) {
  const usersMap = {};
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const chunk = uniqueIds.slice(i, i + BATCH_SIZE);
    const refs = chunk.map((userId) => adminDb.collection("users").doc(userId));
    const snaps = await adminDb.getAll(...refs);

    snaps.forEach((snap) => {
      if (snap.exists) {
        const userData = snap.data();
        usersMap[snap.id] = {
          email: userData.email || null,
          company_name: userData.company_name || null,
        };
      }
    });
  }

  return usersMap;
}

export async function GET(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { searchParams } = new URL(request.url);
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const limitParam = Number.parseInt(searchParams.get("limit") || "10", 10);
    const scanLimitParam = Number.parseInt(
      searchParams.get("scanLimit") || "200",
      10,
    );
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const currency = (searchParams.get("currency") || "").trim().toLowerCase();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
    const safeLimit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 10;
    const scanLimit = Number.isFinite(scanLimitParam)
      ? Math.min(Math.max(scanLimitParam, 50), 500)
      : 200;

    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo).getTime() : null;

    const receiptsSnapshot = await adminDb
      .collection("receipts")
      .orderBy("created", "desc")
      .limit(scanLimit)
      .get();

    const invoices = receiptsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    const missingUserIds = [
      ...new Set(
        invoices
          .filter((invoice) => invoice.userId && !invoice.userEmail)
          .map((invoice) => invoice.userId),
      ),
    ];

    const usersMap = missingUserIds.length
      ? await batchGetUsers(missingUserIds)
      : {};

    const enrichedInvoices = invoices
      .map((invoice) => {
        const userFromReceipt =
          invoice.userEmail || invoice.userCompanyName
            ? {
                email: invoice.userEmail || null,
                company_name: invoice.userCompanyName || null,
              }
            : usersMap[invoice.userId] || null;

        return {
          ...invoice,
          user: userFromReceipt,
          referenceId:
            invoice.receiptNumber ||
            invoice.invoiceId ||
            invoice.checkoutSessionId ||
            null,
          receiptTypeLabel:
            invoice.type === "one_time"
              ? "One-time"
              : invoice.type === "invoice"
                ? "Subscription"
                : invoice.type || "—",
        };
      })
      .filter((invoice) => {
        const createdMs = invoice?.created?.toDate
          ? invoice.created.toDate().getTime()
          : invoice?.created?.seconds
            ? invoice.created.seconds * 1000
            : invoice?.created
              ? new Date(invoice.created).getTime()
              : null;

        if (currency && String(invoice.currency || "").toLowerCase() !== currency) {
          return false;
        }

        if (fromMs && Number.isFinite(createdMs) && createdMs < fromMs) {
          return false;
        }

        if (toMs && Number.isFinite(createdMs) && createdMs > toMs + 86_399_999) {
          return false;
        }

        if (!search) {
          return true;
        }

        const haystack = [
          invoice.receiptNumber || "",
          invoice.invoiceId || "",
          invoice.checkoutSessionId || "",
          invoice.referenceId || "",
          invoice.receiptTypeLabel || "",
          invoice.type || "",
          invoice.user?.email || "",
          invoice.user?.company_name || "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });

    const total = enrichedInvoices.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * safeLimit;
    const pagedInvoices = enrichedInvoices.slice(offset, offset + safeLimit);

    return Response.json({
      success: true,
      data: pagedInvoices,
      pagination: {
        page: currentPage,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    console.error("Error listing admin invoices:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to list invoices",
      },
      { status: 500 },
    );
  }
}
