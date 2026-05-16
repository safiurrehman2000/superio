import { adminDb } from "@/utils/firebase-admin";
import {
  buyerVatLine,
  linesFromStripeCustomerAddress,
  linesFromUserProfile,
} from "@/utils/buildBrandedReceiptPdfForInvoice";
import { getCheckoutSessionDisplayAmounts } from "@/utils/checkoutSessionDisplayAmounts";
import { generateBrandedReceiptPdf } from "@/utils/generateBrandedReceiptPdf";
import { resolvePricingPackageLabel } from "@/utils/resolvePricingPackageLabel";

/**
 * Map Checkout `customer_details.address` into the same shape as Stripe.Address.
 * @param {Record<string, unknown> | null | undefined} addr
 * @returns {import("stripe").Stripe.Address | null}
 */
function checkoutAddressToStripeShape(addr) {
  if (!addr || typeof addr !== "object") return null;
  return {
    line1: /** @type {string} */ (addr.line1 ?? ""),
    line2: /** @type {string} */ (addr.line2 ?? ""),
    city: /** @type {string} */ (addr.city ?? ""),
    postal_code: /** @type {string} */ (addr.postal_code ?? ""),
    state: /** @type {string} */ (addr.state ?? ""),
    country: /** @type {string} */ (addr.country ?? ""),
  };
}

/**
 * Branded PDF for Checkout `mode: payment` (no Stripe Invoice object).
 *
 * @param {import("stripe").Stripe.Checkout.Session} session Expanded session (e.g. `customer.tax_ids`).
 * @param {string|null|undefined} planId
 * @param {string} userId
 * @returns {Promise<Buffer>}
 */
export async function buildBrandedReceiptPdfForOneTimeSession(
  session,
  planId,
  userId,
) {
  const packageName = await resolvePricingPackageLabel(planId);
  const userSnap = await adminDb.collection("users").doc(userId).get();
  const ud = userSnap.exists ? userSnap.data() : {};

  let customer = null;
  const c = session.customer;
  if (c && typeof c === "object" && c.deleted !== true) {
    customer = /** @type {import("stripe").Stripe.Customer} */ (c);
  }

  const details = session.customer_details;
  const customerName =
    String(details?.name || "").trim() ||
    String(
      ud.company_name ||
        ud.companyName ||
        ud.displayName ||
        ud.name ||
        "",
    ).trim() ||
    null;

  const stripeAddrFromDetails = linesFromStripeCustomerAddress(
    checkoutAddressToStripeShape(
      details?.address && typeof details.address === "object"
        ? /** @type {Record<string, unknown>} */ (details.address)
        : null,
    ),
  );
  const stripeAddrFromCustomer = linesFromStripeCustomerAddress(
    customer?.address && typeof customer.address === "object"
      ? customer.address
      : undefined,
  );
  const userAddrLines = linesFromUserProfile(ud);
  const addressLines =
    stripeAddrFromDetails.length > 0
      ? stripeAddrFromDetails
      : stripeAddrFromCustomer.length > 0
        ? stripeAddrFromCustomer
        : userAddrLines;

  const phoneLine =
    String(details?.phone || "").trim() ||
    String(customer?.phone || "").trim() ||
    String(ud.phone || ud.phone_number || "").trim();

  const vatLine = buyerVatLine(customer, ud);

  const customerLines = [
    customerName || "",
    ...addressLines,
    phoneLine,
    vatLine,
  ].map((s) => (s == null ? "" : String(s).trim()));

  const dateShort = session.created
    ? new Date(session.created * 1000).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const { lineExclCents, taxCents, totalCents, vatRateLabel } =
    getCheckoutSessionDisplayAmounts(session);

  const seller = {
    logoText: process.env.RECEIPT_LOGO_TEXT || "DE FLEXIJOBBER",
    name: process.env.RECEIPT_SELLER_NAME || "De Flexijobber",
    line1: process.env.RECEIPT_SELLER_LINE1 || "Belgielei 129A/33",
    line2: process.env.RECEIPT_SELLER_LINE2 || "2018 Antwerpen",
    vat: process.env.RECEIPT_SELLER_VAT || "BE 0655.845.308",
  };

  const termsUrl =
    process.env.RECEIPT_TERMS_URL ||
    "https://www.de-flexi-jobber.be/algemene-voorwaarden";

  const ref = String(session.id || "").replace(/^cs_/, "").slice(0, 18);
  const invoiceTitle = `FACTUUR ${ref}`;

  return generateBrandedReceiptPdf({
    invoiceTitle,
    dateShort,
    seller,
    customerLines,
    lineDescription: packageName || "Eenmalige aankoop",
    lineExclCents,
    taxCents,
    totalCents,
    vatRateLabel,
    termsUrl,
  });
}
