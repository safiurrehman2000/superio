import { adminDb } from "@/utils/firebase-admin";
import { generateBrandedReceiptPdf } from "@/utils/generateBrandedReceiptPdf";
import { getInvoiceDisplayAmounts } from "@/utils/invoiceDisplayAmounts";
import { resolvePricingPackageLabel } from "@/utils/resolvePricingPackageLabel";
import Stripe from "stripe";

function regionDisplayNameNl(iso2) {
  if (!iso2 || typeof iso2 !== "string") return "";
  const c = iso2.trim().toUpperCase();
  if (c.length !== 2) return iso2;
  try {
    return new Intl.DisplayNames(["nl-BE"], { type: "region" }).of(c) || c;
  } catch {
    return c;
  }
}

/**
 * Billing address as collected in Stripe Checkout (Bancontact, card, Peppol, etc.).
 * @param {import("stripe").Stripe.Address | null | undefined} addr
 * @returns {string[]}
 */
function linesFromStripeCustomerAddress(addr) {
  if (!addr || typeof addr !== "object") return [];
  const out = [];
  const l1 = String(addr.line1 || "").trim();
  const l2 = String(addr.line2 || "").trim();
  if (l1) out.push(l1);
  if (l2) out.push(l2);
  const pc = String(addr.postal_code || "").trim();
  const city = String(addr.city || "").trim();
  const locality = [pc, city].filter(Boolean).join(" ").trim();
  if (locality) out.push(locality);
  const state = String(addr.state || "").trim();
  if (state && addr.country && ["US", "CA", "AU"].includes(String(addr.country))) {
    out.push(state);
  }
  const country = String(addr.country || "").trim();
  if (country) {
    const label = regionDisplayNameNl(country);
    if (label) out.push(label);
  }
  return out;
}

/**
 * Fallback when Stripe snapshot is empty — employer profile on Firestore.
 * @param {Record<string, unknown>} ud
 * @returns {string[]}
 */
function linesFromUserProfile(ud) {
  const out = [];
  const street = String(ud.address || ud.street || "").trim();
  const street2 = String(ud.address_line2 || ud.addressLine2 || "").trim();
  if (street) out.push(street);
  if (street2) out.push(street2);
  const pc = String(
    ud.postalCode || ud.postal_code || ud.zip || "",
  ).trim();
  const city = String(ud.city || "").trim();
  const locality = [pc, city].filter(Boolean).join(" ").trim();
  if (locality) out.push(locality);
  else {
    const loc = String(ud.company_location || "").trim();
    if (loc) out.push(loc);
  }
  const cc = String(ud.country || ud.countryCode || "").trim();
  if (cc) {
    if (cc.length === 2) {
      const label = regionDisplayNameNl(cc);
      if (label) out.push(label);
    } else {
      out.push(cc);
    }
  }
  return out;
}

/**
 * Buyer VAT: Stripe Tax ID from Checkout (`tax_id_collection`) or profile fields.
 * @param {import("stripe").Stripe.Customer | null | undefined} customer
 * @param {Record<string, unknown>} ud
 */
function buyerVatLine(customer, ud) {
  const fromProfile =
    ud.vat_number || ud.btw_number || ud.btw || ud.company_vat || "";
  let fromStripe = "";
  if (customer && typeof customer === "object" && !customer.deleted) {
    const taxIds = customer.tax_ids?.data;
    if (Array.isArray(taxIds) && taxIds.length > 0) {
      const eu =
        taxIds.find((t) => t.type === "eu_vat") ||
        taxIds.find((t) => /vat|btw/i.test(String(t.type || ""))) ||
        taxIds[0];
      if (eu?.value) fromStripe = String(eu.value).trim();
    }
  }
  const raw = fromStripe || String(fromProfile || "").trim();
  if (!raw) return "";
  if (/^btw\s*:?/i.test(raw) || /^vat\s*:?/i.test(raw)) return raw;
  return `BTW: ${raw}`;
}

/**
 * Loads invoice + customer tax_ids so receipts match Checkout billing (incl. postcode & VAT).
 * @param {import("stripe").Stripe.Invoice} invoice
 * @returns {Promise<{ inv: import("stripe").Stripe.Invoice; customer: import("stripe").Stripe.Customer | null }>}
 */
async function loadInvoiceAndCustomerForReceipt(invoice) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !invoice?.id) {
    const c0 = invoice.customer;
    const cust =
      c0 && typeof c0 === "object" && c0.deleted !== true
        ? /** @type {import("stripe").Stripe.Customer} */ (c0)
        : null;
    return { inv: invoice, customer: cust };
  }
  const stripe = new Stripe(key);
  try {
    const inv = await stripe.invoices.retrieve(invoice.id, {
      expand: ["customer.tax_ids"],
    });
    let customer = null;
    const c = inv.customer;
    if (c && typeof c === "object" && c.deleted !== true) {
      customer = /** @type {import("stripe").Stripe.Customer} */ (c);
    } else if (typeof inv.customer === "string") {
      const cr = await stripe.customers.retrieve(inv.customer, {
        expand: ["tax_ids"],
      });
      if (!cr.deleted) {
        customer = /** @type {import("stripe").Stripe.Customer} */ (cr);
      }
    }
    return { inv, customer };
  } catch (e) {
    console.warn(
      "buildBrandedReceiptPdfForInvoice: Stripe enrich failed:",
      e?.message || e,
    );
    const c0 = invoice.customer;
    const cust =
      c0 && typeof c0 === "object" && c0.deleted !== true
        ? /** @type {import("stripe").Stripe.Customer} */ (c0)
        : null;
    return { inv: invoice, customer: cust };
  }
}

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

  const { inv, customer } = await loadInvoiceAndCustomerForReceipt(invoice);

  const customerName =
    inv.customer_name ||
    ud.company_name ||
    ud.companyName ||
    ud.displayName ||
    ud.name ||
    null;

  const dateShort = inv.created
    ? new Date(inv.created * 1000).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const amounts = getInvoiceDisplayAmounts(inv);

  const seller = {
    logoText: process.env.RECEIPT_LOGO_TEXT || "DE FLEXIJOBBER",
    name: process.env.RECEIPT_SELLER_NAME || "De Flexijobber",
    line1: process.env.RECEIPT_SELLER_LINE1 || "Belgielei 129A/33",
    line2: process.env.RECEIPT_SELLER_LINE2 || "2018 Antwerpen",
    vat: process.env.RECEIPT_SELLER_VAT || "BE 0655.845.308",
  };

  const stripeAddrLines = linesFromStripeCustomerAddress(inv.customer_address);
  const userAddrLines = linesFromUserProfile(ud);
  const addressLines =
    stripeAddrLines.length > 0 ? stripeAddrLines : userAddrLines;

  const phoneLine =
    String(inv.customer_phone || "").trim() ||
    String(ud.phone || ud.phone_number || "").trim();

  const vatLine = buyerVatLine(customer, ud);

  const customerLines = [
    customerName || "",
    ...addressLines,
    phoneLine,
    vatLine,
  ].map((s) => (s == null ? "" : String(s).trim()));

  const termsUrl =
    process.env.RECEIPT_TERMS_URL ||
    "https://www.de-flexi-jobber.be/algemene-voorwaarden";

  return generateBrandedReceiptPdf({
    invoiceTitle: `FACTUUR ${inv.number || inv.id}`,
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
