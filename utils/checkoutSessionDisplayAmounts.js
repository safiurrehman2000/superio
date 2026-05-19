/**
 * Amounts for branded PDFs from Stripe Checkout Session (one-time / mode payment).
 * Uses amount_total as source of truth so promo codes and discounts match the total row.
 *
 * @param {import('stripe').Stripe.Checkout.Session} session
 * @returns {{ lineExclCents: number, taxCents: number, totalCents: number, vatRateLabel: string }}
 */
export function getCheckoutSessionDisplayAmounts(session) {
  const totalCents = session.amount_total ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const vatRateLabel = '21';

  if (totalCents <= 0) {
    return {
      lineExclCents: 0,
      taxCents: 0,
      totalCents: 0,
      vatRateLabel,
    };
  }

  let lineExclCents = Math.max(0, totalCents - taxCents);

  // Prefer Stripe breakdown when present (tax-inclusive / complex totals).
  const breakdown = session.total_details?.breakdown;
  if (breakdown && typeof breakdown === 'object') {
    const taxFromBreakdown = Array.isArray(breakdown.taxes)
      ? breakdown.taxes.reduce((sum, t) => sum + (t.amount || 0), 0)
      : null;
    if (taxFromBreakdown != null && taxFromBreakdown >= 0) {
      const excl = Math.max(0, totalCents - taxFromBreakdown);
      return {
        lineExclCents: excl,
        taxCents: taxFromBreakdown,
        totalCents,
        vatRateLabel: rateLabelFromAmounts(excl, taxFromBreakdown),
      };
    }
  }

  return {
    lineExclCents,
    taxCents,
    totalCents,
    vatRateLabel: rateLabelFromAmounts(lineExclCents, taxCents),
  };
}

/**
 * @param {number} lineExclCents
 * @param {number} taxCents
 * @returns {string} Numeric rate for PDF template, e.g. "21"
 */
function rateLabelFromAmounts(lineExclCents, taxCents) {
  if (taxCents > 0 && lineExclCents > 0) {
    const pct = Math.round((taxCents / lineExclCents) * 100);
    if (Number.isFinite(pct) && pct > 0) {
      return String(pct);
    }
  }
  return '21';
}
