import { adminDb } from '@/utils/firebase-admin';
import { isCheckoutSessionPaymentComplete } from '@/utils/checkoutPaymentStatus';
import { reactivateArchivedEmployerJobs } from '@/utils/expireOneTimeAccess';

const ONE_TIME_ACCESS_MS = 30 * 24 * 60 * 60 * 1000;

async function resolvePlanIdFromStripePrice(stripePriceId) {
  if (!stripePriceId) return null;

  const pkgQuery = await adminDb
    .collection('pricingPackages')
    .where('stripePriceId', '==', stripePriceId)
    .get();

  if (pkgQuery.empty) return null;

  const pkgDoc = pkgQuery.docs[0];
  const pkgData = pkgDoc.data();
  return pkgData?.id ?? pkgDoc.id ?? null;
}

export async function activateUserAccessFromCheckoutSession(stripe, session) {
  const userId =
    session.metadata?.userId || session.client_reference_id || null;

  if (!userId || !isCheckoutSessionPaymentComplete(session)) {
    return { activated: false, reason: 'not_paid' };
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id || null;
  const metadataPlanId = session.metadata?.planId || null;

  if (session.mode === 'payment') {
    const accessStart = new Date();
    const accessUntil = new Date(accessStart.getTime() + ONE_TIME_ACCESS_MS);

    await adminDb
      .collection('users')
      .doc(userId)
      .set(
        {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          subscriptionStatus: 'one_time_active',
          planId: metadataPlanId,
          subscriptionUpdatedAt: accessStart,
          subscriptionStartDate: accessStart,
          oneTimePurchaseAt: accessStart,
          oneTimeAccessUntil: accessUntil,
          isFirstTime: false,
        },
        { merge: true },
      );

    await reactivateArchivedEmployerJobs(adminDb, userId);
    return { activated: true, accessType: 'one_time', planId: metadataPlanId };
  }

  if (session.mode === 'subscription') {
    let subscription = session.subscription;
    if (typeof subscription === 'string') {
      subscription = await stripe.subscriptions.retrieve(subscription);
    } else if (subscription?.id && !subscription.status) {
      subscription = await stripe.subscriptions.retrieve(subscription.id);
    }

    if (!subscription?.id) {
      return { activated: false, reason: 'no_subscription' };
    }

    const stripePriceId = subscription.items.data[0]?.price?.id || null;
    const resolvedPlanId =
      metadataPlanId ||
      (await resolvePlanIdFromStripePrice(stripePriceId)) ||
      null;
    const accessStart = new Date();

    await adminDb
      .collection('users')
      .doc(userId)
      .set(
        {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          planId: ['canceled', 'incomplete_expired'].includes(
            subscription.status,
          )
            ? null
            : resolvedPlanId,
          subscriptionUpdatedAt: accessStart,
          subscriptionStartDate: accessStart,
          subscriptionPeriodEnd: subscription.current_period_end || null,
          isFirstTime: false,
        },
        { merge: true },
      );

    if (!['canceled', 'incomplete_expired'].includes(subscription.status)) {
      await reactivateArchivedEmployerJobs(adminDb, userId);
    }

    return {
      activated: true,
      accessType: 'subscription',
      planId: resolvedPlanId,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  }

  return { activated: false, reason: 'unknown_mode', mode: session.mode };
}
