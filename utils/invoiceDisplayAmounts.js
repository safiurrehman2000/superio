/**
 * Derive line (excl. VAT), VAT, and total for the invoice PDF.
 * Prefers Stripe tax fields; falls back to 21% Belgian VAT on EUR totals.
 *
 * @param {import("stripe").Stripe.Invoice} invoice
 * @returns {{ lineExclCents: number, taxCents: number, totalCents: number, vatRateLabel: string }}
 */
export function getInvoiceDisplayAmounts(invoice) {
  const totalCents = invoice.amount_paid ?? 0;
  const currency = (invoice.currency || "eur").toLowerCase();
  const vatRateLabel = "21";

  if (totalCents <= 0) {
    return {
      lineExclCents: 0,
      taxCents: 0,
      totalCents: 0,
      vatRateLabel,
    };
  }

  if (invoice.total_taxes?.length) {
    const taxCents = invoice.total_taxes.reduce(
      (a, t) => a + (t.amount || 0),
      0
    );
    let lineExclCents =
      invoice.total_excluding_tax != null
        ? invoice.total_excluding_tax
        : totalCents - taxCents;
    if (lineExclCents < 0) lineExclCents = 0;
    return { lineExclCents, taxCents, totalCents, vatRateLabel };
  }

  if (invoice.total_excluding_tax != null) {
    const lineExclCents = invoice.total_excluding_tax;
    const taxCents = Math.max(0, totalCents - lineExclCents);
    return { lineExclCents, taxCents, totalCents, vatRateLabel };
  }

  if (currency === "eur") {
    const lineExclCents = Math.round(totalCents / 1.21);
    const taxCents = totalCents - lineExclCents;
    return { lineExclCents, taxCents, totalCents, vatRateLabel };
  }

  return {
    lineExclCents: totalCents,
    taxCents: 0,
    totalCents,
    vatRateLabel,
  };
}
