import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function resolvePlanIdFromInvoice(invoice, subscriptionCache) {
  const fromParent = invoice?.parent?.subscription_details?.metadata?.planId;
  if (fromParent) {
    return fromParent;
  }

  const subscriptionRef = invoice.subscription;
  const subscriptionId =
    typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
  if (!subscriptionId) {
    return null;
  }

  if (subscriptionCache[subscriptionId]) {
    return subscriptionCache[subscriptionId].planId;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const planId = subscription?.metadata?.planId || null;
    subscriptionCache[subscriptionId] = { planId };
    return planId;
  } catch (error) {
    console.warn("Failed to resolve subscription metadata:", subscriptionId, error);
    subscriptionCache[subscriptionId] = { planId: null };
    return null;
  }
}

async function resolveUserIdFromInvoice(invoice, customerToUserCache) {
  const customerRef = invoice.customer;
  const customerId = typeof customerRef === "string" ? customerRef : customerRef?.id;
  if (!customerId) {
    return null;
  }

  if (customerToUserCache[customerId] !== undefined) {
    return customerToUserCache[customerId];
  }

  const userByCustomer = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  const userId = userByCustomer.empty ? null : userByCustomer.docs[0].id;
  customerToUserCache[customerId] = userId;
  return userId;
}

export async function POST(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json().catch(() => ({}));
    const maxInvoicesRaw = Number.parseInt(String(body?.maxInvoices || "200"), 10);
    const maxInvoices = Number.isFinite(maxInvoicesRaw)
      ? Math.min(Math.max(maxInvoicesRaw, 1), 1000)
      : 200;

    const customerToUserCache = {};
    const subscriptionCache = {};
    let createdCount = 0;
    let skippedExisting = 0;
    let skippedNoUser = 0;
    let scanned = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore && scanned < maxInvoices) {
      const page = await stripe.invoices.list({
        limit: Math.min(100, maxInvoices - scanned),
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const invoice of page.data) {
        scanned += 1;

        if (invoice.status !== "paid") {
          continue;
        }

        const invoiceId = invoice.id;
        if (!invoiceId) {
          continue;
        }

        const existing = await adminDb
          .collection("receipts")
          .where("invoiceId", "==", invoiceId)
          .limit(1)
          .get();

        if (!existing.empty) {
          skippedExisting += 1;
          continue;
        }

        const userId = await resolveUserIdFromInvoice(invoice, customerToUserCache);
        if (!userId) {
          skippedNoUser += 1;
          continue;
        }

        const planId = await resolvePlanIdFromInvoice(invoice, subscriptionCache);
        const created = invoice.created
          ? new Date(invoice.created * 1000)
          : new Date();

        await adminDb.collection("receipts").add({
          userId,
          planId,
          amount: invoice.amount_paid ?? 0,
          currency: invoice.currency || null,
          receipt_pdf_url: invoice.invoice_pdf || null,
          stripe_invoice_pdf_url: invoice.invoice_pdf || null,
          created,
          invoiceId,
          type: "invoice",
          source: "admin_backfill",
        });
        createdCount += 1;
      }

      hasMore = page.has_more;
      startingAfter = page.data.length ? page.data[page.data.length - 1].id : null;
      if (!startingAfter) {
        break;
      }
    }

    return Response.json({
      success: true,
      message: "Invoice sync completed",
      stats: {
        scanned,
        createdCount,
        skippedExisting,
        skippedNoUser,
      },
    });
  } catch (error) {
    console.error("Error syncing invoices:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to sync invoices",
      },
      { status: 500 },
    );
  }
}
