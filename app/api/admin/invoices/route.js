import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";

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
      searchParams.get("scanLimit") || "500",
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
      ? Math.min(Math.max(scanLimitParam, 50), 2000)
      : 500;

    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo).getTime() : null;

    const receiptsSnapshot = await adminDb
      .collection("receipts")
      .orderBy("created", "desc")
      .limit(scanLimit)
      .get();

    const userIds = new Set();
    const invoices = receiptsSnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.userId) {
        userIds.add(data.userId);
      }
      return {
        id: doc.id,
        ...data,
      };
    });

    const usersMap = {};
    await Promise.all(
      [...userIds].map(async (userId) => {
        try {
          const userDoc = await adminDb.collection("users").doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            usersMap[userId] = {
              email: userData.email || null,
              company_name: userData.company_name || null,
            };
          }
        } catch (error) {
          console.warn("Failed to resolve user for invoice list:", userId, error);
        }
      }),
    );

    const enrichedInvoices = invoices
      .map((invoice) => ({
        ...invoice,
        user: usersMap[invoice.userId] || null,
        referenceId: invoice.invoiceId || invoice.checkoutSessionId || null,
        receiptTypeLabel:
          invoice.type === "one_time"
            ? "One-time"
            : invoice.type === "invoice"
              ? "Subscription"
              : invoice.type || "—",
      }))
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
