import { getOneTimeAccessEndMs } from './expireOneTimeAccess';

const INACTIVE_STATUSES = ['expired', 'one_time_expired', 'canceled'];

/**
 * Employer has an active package (Stripe sub, one-time, or admin-granted).
 */
export function hasActiveEmployerPlan(userData, now = Date.now()) {
  if (!userData) return false;

  const status = userData.subscriptionStatus;
  if (status && INACTIVE_STATUSES.includes(status)) {
    return false;
  }

  if (userData.stripeSubscriptionId) {
    return status !== 'canceled';
  }

  const end = getOneTimeAccessEndMs(userData.oneTimeAccessUntil);
  if (end && end > now) {
    return true;
  }

  if (['one_time_active', 'admin_active', 'active'].includes(status)) {
    return Boolean(userData.planId);
  }

  return false;
}
