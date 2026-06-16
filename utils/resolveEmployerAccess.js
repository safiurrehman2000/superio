import { hasActiveEmployerPlan } from '@/utils/employerAccess';
import {
  getOneTimeAccessEndMs,
  hasActiveOneTimeAccess,
} from '@/utils/expireOneTimeAccess';
import { getPricingPackageByPlanId } from '@/utils/getPricingPackage';
import {
  isActiveStripeSubscriptionStatus,
  resolveActiveStripeSubscription,
} from '@/utils/stripeSubscriptionLookup';

export function getAccessPeriodEndSeconds(userData) {
  if (userData?.subscriptionPeriodEnd) {
    return userData.subscriptionPeriodEnd;
  }

  const oneTimeEnd = getOneTimeAccessEndMs(userData?.oneTimeAccessUntil);
  if (oneTimeEnd) {
    return Math.floor(oneTimeEnd / 1000);
  }

  const updated = userData?.subscriptionUpdatedAt;
  if (updated) {
    const ms =
      typeof updated.toDate === 'function'
        ? updated.toDate().getTime()
        : new Date(updated).getTime();
    if (Number.isFinite(ms)) {
      return Math.floor((ms + 30 * 24 * 60 * 60 * 1000) / 1000);
    }
  }

  return null;
}

async function resolvePlanIdFromStripePrice(adminDb, stripePriceId) {
  if (!stripePriceId) return null;

  const pkgQuery = await adminDb
    .collection('pricingPackages')
    .where('stripePriceId', '==', stripePriceId)
    .limit(1)
    .get();

  if (pkgQuery.empty) return null;

  const pkgDoc = pkgQuery.docs[0];
  const pkgData = pkgDoc.data();
  return pkgData?.id ?? pkgDoc.id ?? null;
}

export async function repairUserStripeSubscription(
  adminDb,
  stripe,
  userId,
  userData,
) {
  if (!userData?.stripeSubscriptionId && !userData?.stripeCustomerId) {
    return { userData, subscription: null, repaired: false };
  }

  const { subscription, repaired } = await resolveActiveStripeSubscription(
    stripe,
    userData,
  );

  if (!subscription || !isActiveStripeSubscriptionStatus(subscription.status)) {
    return { userData, subscription, repaired: false };
  }

  const stripePriceId = subscription.items.data[0]?.price?.id || null;
  const resolvedPlanId =
    userData.planId ||
    (await resolvePlanIdFromStripePrice(adminDb, stripePriceId));

  const updates = {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionPeriodEnd: subscription.current_period_end || null,
    subscriptionUpdatedAt: new Date(),
    ...(resolvedPlanId ? { planId: resolvedPlanId } : {}),
    ...(!userData.subscriptionStartDate
      ? { subscriptionStartDate: new Date() }
      : {}),
  };

  const shouldWrite =
    repaired ||
    subscription.id !== userData.stripeSubscriptionId ||
    subscription.status !== userData.subscriptionStatus ||
    (resolvedPlanId && resolvedPlanId !== userData.planId);

  if (shouldWrite) {
    await adminDb.collection('users').doc(userId).update(updates);
    return {
      userData: { ...userData, ...updates },
      subscription,
      repaired: true,
    };
  }

  return { userData, subscription, repaired: false };
}

/**
 * Single source of truth for whether an employer currently has plan access.
 */
export async function resolveEmployerAccess(adminDb, stripe, userId, userData) {
  let data = userData;
  let subscription = null;

  if (data.stripeSubscriptionId || data.stripeCustomerId) {
    const repaired = await repairUserStripeSubscription(
      adminDb,
      stripe,
      userId,
      data,
    );
    data = repaired.userData;
    subscription = repaired.subscription;

    if (
      subscription &&
      isActiveStripeSubscriptionStatus(subscription.status)
    ) {
      const stripePriceId = subscription.items.data[0]?.price?.id || null;
      const pkg = data.planId
        ? await getPricingPackageByPlanId(adminDb, data.planId)
        : null;

      return {
        active: true,
        accessType: 'subscription',
        status: subscription.status,
        planId: data.planId || null,
        planName: pkg?.packageType || pkg?.name || '',
        stripePriceId,
        current_period_end:
          subscription.current_period_end || getAccessPeriodEndSeconds(data),
        subscription,
        userData: data,
      };
    }
  }

  if (hasActiveOneTimeAccess(data)) {
    const status = data.subscriptionStatus || 'one_time_active';
    const pkg = data.planId
      ? await getPricingPackageByPlanId(adminDb, data.planId)
      : null;

    return {
      active: true,
      accessType: status === 'admin_active' ? 'admin' : 'one_time',
      status,
      planId: data.planId || null,
      planName: pkg?.packageType || pkg?.name || 'One-time package',
      stripePriceId: pkg?.stripePriceId || null,
      current_period_end: getAccessPeriodEndSeconds(data),
      subscription: null,
      userData: data,
    };
  }

  if (hasActiveEmployerPlan(data) && data.planId) {
    const status = data.subscriptionStatus || 'active';
    const pkg = await getPricingPackageByPlanId(adminDb, data.planId);
    const accessType =
      status === 'admin_active'
        ? 'admin'
        : data.oneTimeAccessUntil
          ? 'one_time'
          : 'legacy';

    return {
      active: true,
      accessType,
      status,
      planId: data.planId,
      planName: pkg?.packageType || pkg?.name || '',
      stripePriceId: pkg?.stripePriceId || null,
      current_period_end: getAccessPeriodEndSeconds(data),
      subscription: null,
      userData: data,
    };
  }

  return {
    active: false,
    message: 'No active subscription',
    userData: data,
  };
}
