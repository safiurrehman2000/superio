import { getOneTimeAccessEndMs } from '@/utils/expireOneTimeAccess';
import { getPricingPackageByPlanId } from '@/utils/getPricingPackage';
import { extractJobLimitFromPackage } from '@/utils/pricingPackageLimits';
import { resolveEmployerAccess } from '@/utils/resolveEmployerAccess';

export async function computeJobPostingLimits(adminDb, stripe, userId, userData) {
  const access = await resolveEmployerAccess(adminDb, stripe, userId, userData);

  if (!access.active) {
    return {
      canPost: false,
      active: false,
      message: access.message || 'No active subscription',
      jobLimit: 0,
      jobsPosted: 0,
      remainingJobs: 0,
    };
  }

  const resolvedUser = access.userData || userData;
  const { planId, oneTimeAccessUntil } = resolvedUser;

  let jobLimit = 0;
  let stripePriceId = access.stripePriceId || null;

  if (stripePriceId) {
    const pkgQuery = await adminDb
      .collection('pricingPackages')
      .where('stripePriceId', '==', stripePriceId)
      .limit(1)
      .get();

    if (!pkgQuery.empty) {
      jobLimit = extractJobLimitFromPackage(pkgQuery.docs[0].data());
    }
  }

  if (jobLimit === 0 && planId) {
    const packageData = await getPricingPackageByPlanId(adminDb, planId);
    if (packageData) {
      jobLimit = extractJobLimitFromPackage(packageData);
      stripePriceId = stripePriceId || packageData.stripePriceId || null;
    }
  }

  const jobsQuery = await adminDb
    .collection('jobs')
    .where('employerId', '==', userId)
    .where('status', '==', 'active')
    .get();

  const subscriptionStartDate =
    resolvedUser.subscriptionStartDate || resolvedUser.subscriptionUpdatedAt;

  let jobsPosted = 0;

  if (subscriptionStartDate) {
    const subscriptionStartTime = subscriptionStartDate.toDate
      ? subscriptionStartDate.toDate()
      : new Date(subscriptionStartDate);

    jobsQuery.forEach((jobDoc) => {
      const jobData = jobDoc.data();
      const jobCreatedAt = jobData.createdAt
        ? jobData.createdAt.toDate
          ? jobData.createdAt.toDate()
          : new Date(jobData.createdAt)
        : new Date(0);

      if (jobCreatedAt >= subscriptionStartTime) {
        jobsPosted++;
      }
    });
  } else {
    jobsPosted = jobsQuery.size;
  }

  const remainingJobs = Math.max(0, jobLimit - jobsPosted);
  const oneTimeEnd = getOneTimeAccessEndMs(oneTimeAccessUntil);
  const isRecurringAccess =
    access.accessType === 'subscription' ||
    Boolean(resolvedUser.stripeSubscriptionId);

  const base = {
    active: true,
    jobLimit,
    jobsPosted,
    remainingJobs,
    planId,
    stripePriceId,
    accessType: isRecurringAccess ? 'subscription' : access.accessType,
    oneTimeAccessUntil: oneTimeEnd
      ? new Date(oneTimeEnd).toISOString()
      : null,
  };

  if (remainingJobs <= 0) {
    const message =
      jobLimit === 0
        ? 'Your plan is active but the job posting limit could not be determined. Please refresh your status or contact support.'
        : `You have reached your job posting limit (${jobLimit} jobs). Please upgrade your subscription to post more jobs.`;

    return {
      ...base,
      canPost: false,
      message,
    };
  }

  return {
    ...base,
    canPost: true,
    message: `You can post ${remainingJobs} more job(s) with your current subscription.`,
  };
}
