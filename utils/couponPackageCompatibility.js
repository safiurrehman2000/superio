const STRIPE_MIN_EUR_CHARGE = 0.5;
const CHECKOUT_VAT_RATE = 0.21;

function estimateTotalAfterDiscountEur(priceEuro, coupon) {
  let subtotal = priceEuro;
  if (coupon.percentOff != null) {
    subtotal = priceEuro * (1 - coupon.percentOff / 100);
  } else if (coupon.amountOff != null) {
    subtotal = Math.max(0, priceEuro - coupon.amountOff / 100);
  }
  return subtotal * (1 + CHECKOUT_VAT_RATE);
}

export function getCouponPackageCompatibility(
  coupon,
  pkg,
  promoRestrictions = null,
) {
  const reasons = [];
  const price = parseFloat(pkg.price);
  const isOneTimePackage = pkg.interval === 'one_time';
  const hasNumericPrice = !Number.isNaN(price) && price > 0;

  if (isOneTimePackage && coupon.duration !== 'once') {
    reasons.push(
      `Coupon duration is "${coupon.duration}" but "${pkg.packageType || pkg.name}" is a one-time package. Use duration "once" for one-time packages.`,
    );
  }

  if (coupon.amountOff != null && hasNumericPrice) {
    const discountEuro = coupon.amountOff / 100;
    if (discountEuro >= price) {
      reasons.push(
        `Fixed discount €${discountEuro.toFixed(2)} must be less than the package price €${price.toFixed(2)}.`,
      );
    }
  }

  const restrictedProductIds = coupon.appliesTo?.products || [];
  if (
    restrictedProductIds.length > 0 &&
    pkg.stripeProductId &&
    !restrictedProductIds.includes(pkg.stripeProductId)
  ) {
    reasons.push('Coupon is restricted to other Stripe products only.');
  }

  const minAmount = promoRestrictions?.minimum_amount;
  const minCurrency = promoRestrictions?.minimum_amount_currency;
  if (minAmount != null && minCurrency === 'eur' && hasNumericPrice) {
    const subtotalCents = Math.round(price * 100);
    if (subtotalCents < minAmount) {
      reasons.push(
        `Promotion code requires a minimum order of €${(minAmount / 100).toFixed(2)} (this package is €${price.toFixed(2)} ex. VAT).`,
      );
    }
  }

  if (
    hasNumericPrice &&
    (coupon.percentOff != null || coupon.amountOff != null)
  ) {
    const estimatedTotal = estimateTotalAfterDiscountEur(price, coupon);
    if (estimatedTotal > 0 && estimatedTotal < STRIPE_MIN_EUR_CHARGE) {
      const discountLabel =
        coupon.percentOff != null
          ? `${coupon.percentOff}% off`
          : `€${(coupon.amountOff / 100).toFixed(2)} off`;
      reasons.push(
        `After ${discountLabel}, estimated total ~€${estimatedTotal.toFixed(2)} (incl. VAT) is below Stripe's €${STRIPE_MIN_EUR_CHARGE.toFixed(2)} minimum — checkout shows the code as invalid.`,
      );
    }
  }

  return {
    packageId: pkg.id,
    packageName: pkg.packageType || pkg.name,
    price: pkg.price,
    interval: pkg.interval || 'month',
    checkoutMode: isOneTimePackage ? 'payment' : 'subscription',
    compatible: reasons.length === 0,
    reasons,
  };
}

export function getCouponCompatibilityForPackages(
  coupon,
  packages,
  promoRestrictions = null,
) {
  return (packages || []).map((pkg) =>
    getCouponPackageCompatibility(coupon, pkg, promoRestrictions),
  );
}
