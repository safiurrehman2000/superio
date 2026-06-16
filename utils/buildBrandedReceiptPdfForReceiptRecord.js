import {
  formatReceiptInvoiceTitle,
  receiptCreatedToDate,
} from '@/utils/allocateReceiptNumber';
import {
  buyerVatLine,
  linesFromUserProfile,
} from '@/utils/buildBrandedReceiptPdfForInvoice';
import { adminDb } from '@/utils/firebase-admin';
import { generateBrandedReceiptPdf } from '@/utils/generateBrandedReceiptPdf';
import { getReceiptRecordDisplayAmounts } from '@/utils/receiptRecordDisplayAmounts';
import { resolvePricingPackageLabel } from '@/utils/resolvePricingPackageLabel';

/**
 * Branded PDF when the receipt has no Stripe Checkout session or Invoice
 * (e.g. admin backfill or legacy rows).
 *
 * @param {Record<string, unknown>} receiptData
 * @param {string} receiptNumber
 * @returns {Promise<Buffer>}
 */
export async function buildBrandedReceiptPdfForReceiptRecord(
  receiptData,
  receiptNumber,
) {
  const userId = receiptData.userId;
  const planId = receiptData.planId;

  const userSnap = await adminDb.collection('users').doc(String(userId)).get();
  const ud = userSnap.exists ? userSnap.data() : {};

  const packageName = await resolvePricingPackageLabel(
    typeof planId === 'string' ? planId : null,
  );

  const customerName =
    String(
      ud.company_name ||
        ud.companyName ||
        ud.displayName ||
        ud.name ||
        '',
    ).trim() || null;

  const addressLines = linesFromUserProfile(ud);
  const phoneLine = String(ud.phone || ud.phone_number || '').trim();
  const vatLine = buyerVatLine(null, ud);

  const customerLines = [
    customerName || '',
    ...addressLines,
    phoneLine,
    vatLine,
  ].map((s) => (s == null ? '' : String(s).trim()));

  const createdDate = receiptCreatedToDate(receiptData.created);
  const dateShort = createdDate.toLocaleDateString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const { lineExclCents, taxCents, totalCents, vatRateLabel } =
    getReceiptRecordDisplayAmounts(receiptData);

  const seller = {
    logoText: process.env.RECEIPT_LOGO_TEXT || 'DE FLEXIJOBBER',
    name: process.env.RECEIPT_SELLER_NAME || 'De Flexijobber',
    line1: process.env.RECEIPT_SELLER_LINE1 || 'Belgielei 129A/33',
    line2: process.env.RECEIPT_SELLER_LINE2 || '2018 Antwerpen',
    vat: process.env.RECEIPT_SELLER_VAT || 'BE 0655.845.308',
  };

  const termsUrl =
    process.env.RECEIPT_TERMS_URL ||
    'https://www.de-flexi-jobber.be/algemene-voorwaarden';

  return generateBrandedReceiptPdf({
    invoiceTitle: formatReceiptInvoiceTitle(receiptNumber),
    dateShort,
    seller,
    customerLines,
    lineDescription: packageName || 'Eenmalige aankoop',
    lineExclCents,
    taxCents,
    totalCents,
    vatRateLabel,
    termsUrl,
  });
}
