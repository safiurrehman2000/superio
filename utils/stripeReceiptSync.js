import { createReceiptWithAllocatedNumber } from '@/utils/allocateReceiptNumber';
import { isCheckoutSessionPaymentComplete } from '@/utils/checkoutPaymentStatus';
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
  if (!isCheckoutSessionPaymentComplete(session)) return;

  const userId =
    session.metadata?.userId || session.client_reference_id || null;
  if (!userId) {
    console.warn(
      'processOneTimeCheckoutReceipt: missing userId on session',
      session.id,
    );
    return;
  }

  const receiptRef = adminDb.collection('receipts').doc(session.id);
  const existingReceipt = await receiptRef.get();
  if (existingReceipt.exists) {
    console.log(
      'Receipt already exists for checkout session',
      session.id,
      '— skipping',
    );
    return;
  }

  const legacyDup = await adminDb
    .collection('receipts')
    .where('checkoutSessionId', '==', session.id)
    .limit(1)
    .get();
  if (!legacyDup.empty) {
    console.log(
      'Receipt already exists for checkout session (legacy doc)',
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

  let createResult;
  try {
    createResult = await createReceiptWithAllocatedNumber(
      session.id,
      {
        userId,
        planId,
        amount,
        currency,
        receipt_pdf_url: null,
        stripe_invoice_pdf_url: null,
        created,
        checkoutSessionId: session.id,
        type: 'one_time',
      },
      created,
    );
  } catch (err) {
    console.error('processOneTimeCheckoutReceipt: Firestore write failed', err);
    return;
  }

  if (!createResult.created) {
    console.log(
      'Receipt already exists for checkout session (concurrent write)',
      session.id,
      '— skipping',
    );
    return;
  }

  const { receiptNumber } = createResult;
  console.log('One-time receipt written to Firestore', session.id);

  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && receiptNumber) {
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
      const receipt_pdf_url = await uploadBrandedReceiptPdf({
        userId,
        invoiceId: storageKey,
        pdfBuffer,
      });
      await receiptRef.update({ receipt_pdf_url });
    } catch (err) {
      console.error(
        'processOneTimeCheckoutReceipt: branded PDF / upload failed',
        err,
      );
    }
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

  const receiptRef = adminDb.collection('receipts').doc(invoiceId);
  const existingReceipt = await receiptRef.get();
  if (existingReceipt.exists) {
    console.log('Receipt already exists for invoice', invoiceId, '— skipping');
    return;
  }

  const legacyDup = await adminDb
    .collection('receipts')
    .where('invoiceId', '==', invoiceId)
    .limit(1)
    .get();
  if (!legacyDup.empty) {
    console.log(
      'Receipt already exists for invoice (legacy doc)',
      invoiceId,
      '— skipping',
    );
    return;
  }

  if (!userId) {
    console.warn(
      'processPaidInvoiceReceipt: no userId for invoice',
      invoiceId,
    );
    return;
  }

  let createResult;
  try {
    createResult = await createReceiptWithAllocatedNumber(
      invoiceId,
      {
        userId,
        planId,
        amount,
        currency,
        receipt_pdf_url: stripe_invoice_pdf_url,
        stripe_invoice_pdf_url,
        created,
        invoiceId,
        type: 'invoice',
      },
      created,
    );
  } catch (err) {
    console.error('Error writing invoice receipt to Firestore:', err);
    return;
  }

  if (!createResult.created) {
    console.log(
      'Receipt already exists for invoice (concurrent write)',
      invoiceId,
      '— skipping',
    );
    return;
  }

  const { receiptNumber } = createResult;
  console.log('Invoice receipt successfully written to Firestore', invoiceId);

  if (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    receiptNumber
  ) {
    try {
      const pdfBuffer = await buildBrandedReceiptPdfForInvoice(
        invoice,
        planId,
        userId,
        receiptNumber,
      );
      const storageKey = receiptNumber.replace(/\//g, '-');
      const receipt_pdf_url = await uploadBrandedReceiptPdf({
        userId,
        invoiceId: storageKey,
        pdfBuffer,
      });
      await receiptRef.update({ receipt_pdf_url });
    } catch (err) {
      console.error(
        'Branded receipt PDF failed, using Stripe invoice PDF if available:',
        err,
      );
    }
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

  if (!isCheckoutSessionPaymentComplete(session)) {
    return {
      ok: false,
      reason: 'not_paid',
      payment_status: session.payment_status,
      status: session.status,
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

function userAccessCreatedAt(userData) {
  const raw =
    userData?.oneTimePurchaseAt ??
    userData?.subscriptionStartDate ??
    userData?.subscriptionUpdatedAt;
  if (!raw) {
    return new Date();
  }
  if (typeof raw.toDate === 'function') {
    return raw.toDate();
  }
  if (raw._seconds) {
    return new Date(raw._seconds * 1000);
  }
  return new Date(raw);
}

/**
 * Create a €0 (or package-priced) one-time receipt from active user access when
 * Checkout completed but receipt sync was missed (no completed Stripe session to attach).
 * @param {string} userId
 */
export async function createMissingOneTimeReceiptFromUserAccess(userId) {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { ok: false, reason: 'user_not_found' };
  }

  const userData = userDoc.data();
  const planId = userData.planId || null;
  if (!planId) {
    return { ok: false, reason: 'no_plan' };
  }

  const existing = await adminDb
    .collection('receipts')
    .where('userId', '==', userId)
    .where('planId', '==', planId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return {
      ok: true,
      reason: 'already_exists',
      receiptId: existing.docs[0].id,
    };
  }

  const pkgDoc = await adminDb.collection('pricingPackages').doc(planId).get();
  const pkgData = pkgDoc.exists ? pkgDoc.data() : {};
  const priceEuro = Number(pkgData.price ?? 0);
  const amount = Number.isFinite(priceEuro) ? Math.round(priceEuro * 100) : 0;
  const currency = pkgData.currency || 'eur';
  const created = userAccessCreatedAt(userData);
  const receiptDocId = `access_${userId}_${planId}`;

  let createResult;
  try {
    createResult = await createReceiptWithAllocatedNumber(
      receiptDocId,
      {
        userId,
        planId,
        amount,
        currency,
        receipt_pdf_url: null,
        stripe_invoice_pdf_url: null,
        created,
        checkoutSessionId: null,
        type: 'one_time',
        source: 'admin_backfill',
      },
      created,
    );
  } catch (err) {
    console.error('createMissingOneTimeReceiptFromUserAccess failed', err);
    return { ok: false, reason: 'create_failed' };
  }

  if (!createResult.created) {
    return {
      ok: true,
      reason: 'already_exists',
      receiptId: receiptDocId,
      receiptNumber: createResult.receiptNumber,
    };
  }

  return {
    ok: true,
    reason: 'created',
    receiptId: receiptDocId,
    receiptNumber: createResult.receiptNumber,
  };
}

/**
 * Backfill receipts from completed Stripe Checkout sessions for a user.
 * @param {import('stripe').Stripe} stripe
 * @param {string} userId
 */
export async function backfillCheckoutReceiptsForUser(stripe, userId) {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { created: 0, skipped: 0, reason: 'user_not_found' };
  }

  const customerId = userDoc.data().stripeCustomerId;
  if (!customerId) {
    return { created: 0, skipped: 0, reason: 'no_stripe_customer' };
  }

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 100,
  });

  let created = 0;
  let skipped = 0;

  for (const session of sessions.data) {
    if (session.mode !== 'payment' || !isCheckoutSessionPaymentComplete(session)) {
      skipped += 1;
      continue;
    }

    const before = await adminDb.collection('receipts').doc(session.id).get();
    await processOneTimeCheckoutReceipt(stripe, session);
    const after = await adminDb.collection('receipts').doc(session.id).get();
    if (!before.exists && after.exists) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  return { created, skipped };
}
