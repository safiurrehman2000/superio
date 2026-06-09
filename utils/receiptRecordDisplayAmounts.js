/**
 * Amounts for branded PDFs from a Firestore receipt (no Stripe session/invoice).
 *
 * @param {{ amount?: number; currency?: string }} receiptData
 * @returns {{ lineExclCents: number; taxCents: number; totalCents: number; vatRateLabel: string }}
 */
export function getReceiptRecordDisplayAmounts(receiptData) {
  const totalCents = receiptData.amount ?? 0;
  const currency = (receiptData.currency || 'eur').toLowerCase();
  const vatRateLabel = '21';

  if (totalCents <= 0) {
    return {
      lineExclCents: 0,
      taxCents: 0,
      totalCents: 0,
      vatRateLabel,
    };
  }

  if (currency === 'eur') {
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
