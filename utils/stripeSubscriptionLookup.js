const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function isActiveStripeSubscriptionStatus(status) {
  return ACTIVE_STATUSES.has(status);
}

/**
 * Retrieve the employer's usable Stripe subscription, repairing stale IDs when possible.
 */
export async function resolveActiveStripeSubscription(stripe, userData) {
  const { stripeSubscriptionId, stripeCustomerId } = userData || {};
  let subscription = null;

  if (stripeSubscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      if (isActiveStripeSubscriptionStatus(subscription.status)) {
        return { subscription, repaired: false };
      }
    } catch {
      subscription = null;
    }
  }

  if (!stripeCustomerId) {
    return { subscription: null, repaired: false };
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find((sub) =>
      isActiveStripeSubscriptionStatus(sub.status),
    );

    if (activeSubscription) {
      return { subscription: activeSubscription, repaired: true };
    }

    if (!subscription && subscriptions.data.length > 0) {
      return { subscription: subscriptions.data[0], repaired: false };
    }
  } catch (error) {
    console.error('resolveActiveStripeSubscription failed:', error);
  }

  return { subscription, repaired: false };
}
