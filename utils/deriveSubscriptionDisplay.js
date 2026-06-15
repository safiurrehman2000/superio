import { getOneTimeAccessEndMs } from "@/utils/expireOneTimeAccess";

const INACTIVE_STATUSES = [
  "expired",
  "one_time_expired",
  "canceled",
  "cancelled",
  "incomplete_expired",
];

function resolvePlanName(planMap, planId, fallback = "-") {
  if (planId && planMap[planId]) return planMap[planId];
  return fallback || planId || "-";
}

function computeDaysLeft(periodEndSeconds) {
  if (!periodEndSeconds) return "-";
  return Math.max(
    0,
    Math.ceil((periodEndSeconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

/**
 * Derive admin subscription table fields from a user document (no extra API calls).
 */
export function deriveSubscriptionDisplay(user, planMap = {}) {
  const status = user.subscriptionStatus;

  if (status && INACTIVE_STATUSES.includes(status)) {
    return {
      planName: "-",
      daysLeft: "-",
      planId: user.planId || null,
      hasActiveSubscription: false,
      accessType: null,
    };
  }

  if (!user.stripeSubscriptionId) {
    const endMs = getOneTimeAccessEndMs(user.oneTimeAccessUntil);
    if (endMs && endMs > Date.now()) {
      const accessType = status === "admin_active" ? "admin" : "one_time";
      return {
        hasActiveSubscription: true,
        accessType,
        planName: resolvePlanName(
          planMap,
          user.planId,
          accessType === "admin" ? "Granted package" : "One-time package",
        ),
        daysLeft: computeDaysLeft(Math.floor(endMs / 1000)),
        planId: user.planId || null,
      };
    }

    if (
      ["one_time_active", "admin_active", "active"].includes(status) &&
      user.planId
    ) {
      const accessType = status === "admin_active" ? "admin" : "one_time";
      return {
        hasActiveSubscription: true,
        accessType,
        planName: resolvePlanName(planMap, user.planId, "Granted package"),
        daysLeft: "-",
        planId: user.planId,
      };
    }

    return {
      planName: "-",
      daysLeft: "-",
      planId: null,
      hasActiveSubscription: false,
      accessType: null,
    };
  }

  if (status && INACTIVE_STATUSES.includes(status)) {
    return {
      planName: "-",
      daysLeft: "-",
      planId: null,
      hasActiveSubscription: false,
      accessType: null,
    };
  }

  return {
    hasActiveSubscription: true,
    accessType: "subscription",
    planName: resolvePlanName(planMap, user.planId, "-"),
    daysLeft: computeDaysLeft(user.subscriptionPeriodEnd),
    planId: user.planId || null,
  };
}
