import Stripe from 'stripe';
import {
  ensureReceiptNumberOnDocument,
  receiptPdfFilename,
} from '@/utils/allocateReceiptNumber';
import { buildBrandedReceiptPdfForInvoice } from '@/utils/buildBrandedReceiptPdfForInvoice';
import { buildBrandedReceiptPdfForOneTimeSession } from '@/utils/buildBrandedReceiptPdfForOneTimeSession';
import { uploadBrandedReceiptPdf } from '@/utils/uploadBrandedReceiptPdf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  if (checkoutSessionId && !invoiceId) {
    const sessionFull = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['customer', 'customer.tax_ids'],
    });
    const buffer = await buildBrandedReceiptPdfForOneTimeSession(
      sessionFull,
      planId,
      userId,
      receiptNumber,
    );
    if (!buffer?.length) {
      throw new Error('Generated PDF buffer is empty');
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (bucketName) {
      try {
        await uploadBrandedReceiptPdf({
          userId,
          invoiceId: storageKey,
          pdfBuffer: buffer,
        });
      } catch (cacheErr) {
        console.error('generateReceiptPdfForRecord: storage cache failed', cacheErr);
      }
    }

    return { buffer, filename };
  }

  if (!invoiceId) {
    throw new Error('No invoice or checkout session on receipt');
  }

  const inv = await stripe.invoices.retrieve(invoiceId);
  const buffer = await buildBrandedReceiptPdfForInvoice(
    inv,
    planId,
    userId,
    receiptNumber,
  );
  if (!buffer?.length) {
    throw new Error('Generated PDF buffer is empty');
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (bucketName) {
    try {
      await uploadBrandedReceiptPdf({
        userId,
        invoiceId: storageKey,
        pdfBuffer: buffer,
      });
    } catch (cacheErr) {
      console.error('generateReceiptPdfForRecord: storage cache failed', cacheErr);
    }
  }

  return { buffer, filename };
}
