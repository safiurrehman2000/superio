import {
  allocateReceiptNumber,
  receiptCreatedToDate,
  receiptPdfFilename,
} from '@/utils/allocateReceiptNumber';
import { adminDb } from '@/utils/firebase-admin';
import { buildBrandedReceiptPdfForInvoice } from '@/utils/buildBrandedReceiptPdfForInvoice';
import { buildBrandedReceiptPdfForOneTimeSession } from '@/utils/buildBrandedReceiptPdfForOneTimeSession';
import { uploadBrandedReceiptPdf } from '@/utils/uploadBrandedReceiptPdf';

/**
 * One-time Checkout (`mode: payment`): Firestore receipt + optional branded PDF in Storage.
 * @param {import('stripe').Stripe} stripe
 * @param {import('stripe').Stripe.Checkout.Session} session
 */
export async function processOneTimeCheckoutReceipt(stripe, session) {
  if (session.mode !== 'payment') return;
  if (session.payment_status !== 'paid') return;

  const userId =
    session.metadata?.userId || session.client_reference_id || null;
  if (!userId) {
    console.warn(
      'processOneTimeCheckoutReceipt: missing userId on session',
      session.id,
    );
    return;
  }

  const dup = await adminDb
    .collection('receipts')
    .where('checkoutSessionId', '==', session.id)
    .limit(1)
    .get();
  if (!dup.empty) {
    console.log(
      'Receipt already exists for checkout session',
      session.id,
      '— skipping',
    );
    return;
  }

  const planId = session.metadata?.planId || null;
  const amount = session.amount_total ?? 0;
  const currency = session.currency || 'eur';
  const created = session.created
    ? new Date(session.created * 1000)
    : new Date();

  const { receiptNumber } = await allocateReceiptNumber(
    receiptCreatedToDate(created),
  );

  let receipt_pdf_url = null;

  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    try {
      const sessionFull = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer', 'customer.tax_ids'],
      });
      const pdfBuffer = await buildBrandedReceiptPdfForOneTimeSession(
        sessionFull,
        planId,
        userId,
        receiptNumber,
      );
      const storageKey = receiptNumber.replace(/\//g, '-');
      receipt_pdf_url = await uploadBrandedReceiptPdf({
        userId,
        invoiceId: storageKey,
        pdfBuffer,
      });
    } catch (err) {
      console.error(
        'processOneTimeCheckoutReceipt: branded PDF / upload failed',
        err,
      );
    }
  }

  try {
    await adminDb.collection('receipts').add({
      userId,
      planId,
      amount,
      currency,
      receipt_pdf_url,
      stripe_invoice_pdf_url: null,
      created,
      checkoutSessionId: session.id,
      receiptNumber,
      type: 'one_time',
    });
    console.log('One-time receipt written to Firestore', session.id);
  } catch (err) {
    console.error('processOneTimeCheckoutReceipt: Firestore write failed', err);
  }
}

/**
 * Paid subscription invoice → Firestore receipt + branded PDF (idempotent on invoice id).
 * @param {import('stripe').Stripe} stripe
 * @param {import('stripe').Stripe.Invoice} invoice
 */
export async function processPaidInvoiceReceipt(stripe, invoice) {
  let userId =
    invoice?.parent?.subscription_details?.metadata?.userId || null;
  let planId =
    invoice?.parent?.subscription_details?.metadata?.planId || null;

  const subscriptionRef = invoice.subscription;
  const subscriptionId =
    typeof subscriptionRef === 'string'
      ? subscriptionRef
      : subscriptionRef?.id || null;

  if ((!userId || !planId) && subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      userId = userId || sub.metadata?.userId || null;
      planId = planId || sub.metadata?.planId || null;
    } catch (e) {
      console.error(
        'Could not retrieve subscription for invoice metadata:',
        e,
      );
    }
  }

  if (!userId && invoice.customer) {
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;
    if (customerId) {
      const employerQuery = await adminDb
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();
      if (!employerQuery.empty) {
        userId = employerQuery.docs[0].id;
      }
    }
  }

  const amount = invoice.amount_paid;
  const currency = invoice.currency;
  const stripe_invoice_pdf_url = invoice.invoice_pdf || null;
  const created = invoice.created
    ? new Date(invoice.created * 1000)
    : new Date();
  const invoiceId = invoice.id;

  const dupInv = await adminDb
    .collection('receipts')
    .where('invoiceId', '==', invoiceId)
    .limit(1)
    .get();
  if (!dupInv.empty) {
    console.log('Receipt already exists for invoice', invoiceId, '— skipping');
    return;
  }

  if (!userId) {
    console.warn(
      'processPaidInvoiceReceipt: no userId for invoice',
      invoiceId,
    );
    return;
  }

  const { receiptNumber } = await allocateReceiptNumber(
    receiptCreatedToDate(created),
  );

  let receipt_pdf_url = stripe_invoice_pdf_url;

  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    try {
      const pdfBuffer = await buildBrandedReceiptPdfForInvoice(
        invoice,
        planId,
        userId,
        receiptNumber,
      );
      const storageKey = receiptNumber.replace(/\//g, '-');
      receipt_pdf_url = await uploadBrandedReceiptPdf({
        userId,
        invoiceId: storageKey,
        pdfBuffer,
      });
    } catch (err) {
      console.error(
        'Branded receipt PDF failed, using Stripe invoice PDF if available:',
        err,
      );
      receipt_pdf_url = stripe_invoice_pdf_url;
    }
  }

  try {
    await adminDb.collection('receipts').add({
      userId,
      planId,
      amount,
      currency,
      receipt_pdf_url,
      stripe_invoice_pdf_url,
      created,
      invoiceId,
      receiptNumber,
      type: 'invoice',
    });
    console.log('Invoice receipt successfully written to Firestore', invoiceId);
  } catch (err) {
    console.error('Error writing invoice receipt to Firestore:', err);
  }
}

/**
 * After Checkout completes: create receipt from session (works when webhooks do not hit localhost).
 * @param {import('stripe').Stripe} stripe
 * @param {string} sessionId
 * @returns {Promise<{ ok: boolean; mode?: string; reason?: string; invoiceStatus?: string }>}
 */
export async function ensureReceiptFromCompletedCheckoutSession(
  stripe,
  sessionId,
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription.latest_invoice', 'customer', 'customer.tax_ids'],
  });

  if (
    session.payment_status !== 'paid' &&
    session.payment_status !== 'no_payment_required'
  ) {
    return {
      ok: false,
      reason: 'not_paid',
      payment_status: session.payment_status,
    };
  }

  if (session.mode === 'payment') {
    await processOneTimeCheckoutReceipt(stripe, session);
    return { ok: true, mode: 'payment' };
  }

  if (session.mode === 'subscription') {
    const sub = session.subscription;
    let latestInv = null;
    if (typeof sub === 'object' && sub && 'latest_invoice' in sub) {
      latestInv = sub.latest_invoice;
    } else if (typeof sub === 'string') {
      const s = await stripe.subscriptions.retrieve(sub, {
        expand: ['latest_invoice'],
      });
      latestInv = s.latest_invoice;
    } else if (typeof sub === 'object' && sub?.id) {
      const s = await stripe.subscriptions.retrieve(sub.id, {
        expand: ['latest_invoice'],
      });
      latestInv = s.latest_invoice;
    }

    const invoice =
      typeof latestInv === 'string'
        ? await stripe.invoices.retrieve(latestInv)
        : latestInv;

    if (!invoice?.id) {
      return { ok: false, reason: 'no_invoice' };
    }
    if (invoice.status !== 'paid') {
      return {
        ok: false,
        reason: 'invoice_not_paid',
        invoiceStatus: invoice.status,
      };
    }

    await processPaidInvoiceReceipt(stripe, invoice);
    return { ok: true, mode: 'subscription' };
  }

  return { ok: false, reason: 'unknown_mode', mode: session.mode };
}
