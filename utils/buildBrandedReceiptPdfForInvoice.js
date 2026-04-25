import { adminDb } from "@/utils/firebase-admin";
import { generateBrandedReceiptPdf } from "@/utils/generateBrandedReceiptPdf";
import { getInvoiceDisplayAmounts } from "@/utils/invoiceDisplayAmounts";
import { resolvePricingPackageLabel } from "@/utils/resolvePricingPackageLabel";

/**
 * Builds the De Flexijobber–styled PDF buffer from a Stripe Invoice + local user/package data.
 *
 * @param {import("stripe").Stripe.Invoice} invoice
 * @param {string|null|undefined} planId
 * @param {string} userId Firebase user id (employer)
 * @returns {Promise<Buffer>}
 */
export async function buildBrandedReceiptPdfForInvoice(invoice, planId, userId) {
  const packageName = await resolvePricingPackageLabel(planId);
  const userSnap = await adminDb.collection("users").doc(userId).get();
  const ud = userSnap.exists ? userSnap.data() : {};
  const customerName =
    ud.company_name ||
    ud.companyName ||
    ud.displayName ||
    ud.name ||
    invoice.customer_name ||
    null;
  const dateShort = invoice.created
    ? new Date(invoice.created * 1000).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const amounts = getInvoiceDisplayAmounts(invoice);

  const seller = {
    logoText: process.env.RECEIPT_LOGO_TEXT || "DE FLEXIJOBBER",
    name: process.env.RECEIPT_SELLER_NAME || "De Flexijobber",
    line1: process.env.RECEIPT_SELLER_LINE1 || "Belgielei 129A/33",
    line2: process.env.RECEIPT_SELLER_LINE2 || "2018 Antwerpen",
    vat: process.env.RECEIPT_SELLER_VAT || "BE 0655.845.308",
  };

  const addressLine =
    [ud.postalCode, ud.city].filter(Boolean).join(" ") ||
    ud.address ||
    ud.street ||
    "";
  const phoneLine = ud.phone || ud.phone_number || invoice.customer_phone || "";
  const customerLines = [
    customerName || "",
    addressLine || ud.company_location || "",
    phoneLine,
    ud.vat_number || ud.btw_number || ud.btw || "",
  ].map((s) => (s == null ? "" : String(s).trim()));

  const termsUrl =
    process.env.RECEIPT_TERMS_URL ||
    "https://www.de-flexi-jobber.be/algemene-voorwaarden";

  return generateBrandedReceiptPdf({
    invoiceTitle: `FACTUUR ${invoice.number || invoice.id}`,
    dateShort,
    seller,
    customerLines,
    lineDescription: packageName || "Abonnement",
    lineExclCents: amounts.lineExclCents,
    taxCents: amounts.taxCents,
    totalCents: amounts.totalCents,
    vatRateLabel: amounts.vatRateLabel,
    termsUrl,
  });
}
