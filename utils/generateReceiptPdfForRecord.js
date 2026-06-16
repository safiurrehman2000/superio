import Stripe from 'stripe';
import {
  ensureReceiptNumberOnDocument,
  receiptPdfFilename,
} from '@/utils/allocateReceiptNumber';
import { buildBrandedReceiptPdfForInvoice } from '@/utils/buildBrandedReceiptPdfForInvoice';
import { buildBrandedReceiptPdfForOneTimeSession } from '@/utils/buildBrandedReceiptPdfForOneTimeSession';
import { buildBrandedReceiptPdfForReceiptRecord } from '@/utils/buildBrandedReceiptPdfForReceiptRecord';
import { uploadBrandedReceiptPdf } from '@/utils/uploadBrandedReceiptPdf';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function cacheReceiptPdfInBackground({ userId, storageKey, pdfBuffer }) {
  if (
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.RECEIPT_SKIP_STORAGE_CACHE === 'true'
  ) {
    return;
  }

  void uploadBrandedReceiptPdf({
    userId,
    invoiceId: storageKey,
    pdfBuffer,
  }).catch((cacheErr) => {
    console.error(
      'generateReceiptPdfForRecord: storage cache failed',
      cacheErr?.message || cacheErr,
    );
  });
}

function assertPdfBuffer(buffer) {
  if (!buffer?.length) {
    throw new Error('Generated PDF buffer is empty');
  }
  return buffer;
}

/**
 * @param {Record<string, unknown>} receiptData Firestore receipt document fields
 * @param {{ receiptDocId?: string }} [options]
 * @returns {Promise<{ buffer: Buffer; filename: string }>}
 */
export async function generateReceiptPdfForRecord(receiptData, options = {}) {
  const userId = receiptData.userId;
  const planId = receiptData.planId;
  const checkoutSessionId = receiptData.checkoutSessionId;
  const invoiceId = receiptData.invoiceId;
  const { receiptDocId } = options;

  let receiptNumber = receiptData.receiptNumber;
  if (!receiptNumber && receiptDocId) {
    receiptNumber = await ensureReceiptNumberOnDocument(receiptDocId);
  }
  if (!receiptNumber) {
    throw new Error('Receipt has no receipt number');
  }

  const filename = receiptPdfFilename(receiptNumber);
  const storageKey = receiptNumber.replace(/\//g, '-');
  let buffer = null;

  if (checkoutSessionId && !invoiceId && stripe) {
    try {
      const sessionFull = await stripe.checkout.sessions.retrieve(
        String(checkoutSessionId),
        {
          expand: ['customer', 'customer.tax_ids'],
        },
      );
      buffer = await buildBrandedReceiptPdfForOneTimeSession(
        sessionFull,
        planId,
        userId,
        receiptNumber,
      );
    } catch (sessionErr) {
      console.warn(
        'generateReceiptPdfForRecord: checkout session PDF failed, using receipt record fallback',
        sessionErr?.message || sessionErr,
      );
    }
  }

  if (!buffer && invoiceId && stripe) {
    try {
      const inv = await stripe.invoices.retrieve(String(invoiceId));
      buffer = await buildBrandedReceiptPdfForInvoice(
        inv,
        planId,
        userId,
        receiptNumber,
      );
    } catch (invoiceErr) {
      console.warn(
        'generateReceiptPdfForRecord: invoice PDF failed, using receipt record fallback',
        invoiceErr?.message || invoiceErr,
      );
    }
  }

  if (!buffer) {
    buffer = await buildBrandedReceiptPdfForReceiptRecord(
      receiptData,
      receiptNumber,
    );
  }

  assertPdfBuffer(buffer);
  cacheReceiptPdfInBackground({ userId, storageKey, pdfBuffer: buffer });

  return { buffer, filename };
}
