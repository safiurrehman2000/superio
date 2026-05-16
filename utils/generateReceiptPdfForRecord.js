import Stripe from 'stripe';
import { buildBrandedReceiptPdfForInvoice } from '@/utils/buildBrandedReceiptPdfForInvoice';
import { buildBrandedReceiptPdfForOneTimeSession } from '@/utils/buildBrandedReceiptPdfForOneTimeSession';
import { uploadBrandedReceiptPdf } from '@/utils/uploadBrandedReceiptPdf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @param {Record<string, unknown>} receiptData Firestore receipt document fields
 * @returns {Promise<{ buffer: Buffer; filename: string }>}
 */
export async function generateReceiptPdfForRecord(receiptData) {
  const userId = receiptData.userId;
  const planId = receiptData.planId;
  const checkoutSessionId = receiptData.checkoutSessionId;
  const invoiceId = receiptData.invoiceId;

  if (checkoutSessionId && !invoiceId) {
    const safeId = String(checkoutSessionId).replace(/[^\w.-]/g, '_');
    const sessionFull = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['customer', 'customer.tax_ids'],
    });
    const buffer = await buildBrandedReceiptPdfForOneTimeSession(
      sessionFull,
      planId,
      userId,
    );
    if (!buffer?.length) {
      throw new Error('Generated PDF buffer is empty');
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (bucketName) {
      try {
        await uploadBrandedReceiptPdf({
          userId,
          invoiceId: `one-time-${checkoutSessionId}`,
          pdfBuffer: buffer,
        });
      } catch (cacheErr) {
        console.error('generateReceiptPdfForRecord: storage cache failed', cacheErr);
      }
    }

    return { buffer, filename: `factuur-${safeId}.pdf` };
  }

  if (!invoiceId) {
    throw new Error('No invoice or checkout session on receipt');
  }

  const safeInvoiceId = String(invoiceId).replace(/[^\w.-]/g, '_');
  const inv = await stripe.invoices.retrieve(invoiceId);
  const buffer = await buildBrandedReceiptPdfForInvoice(inv, planId, userId);
  if (!buffer?.length) {
    throw new Error('Generated PDF buffer is empty');
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (bucketName) {
    try {
      await uploadBrandedReceiptPdf({
        userId,
        invoiceId,
        pdfBuffer: buffer,
      });
    } catch (cacheErr) {
      console.error('generateReceiptPdfForRecord: storage cache failed', cacheErr);
    }
  }

  return { buffer, filename: `factuur-${safeInvoiceId}.pdf` };
}
