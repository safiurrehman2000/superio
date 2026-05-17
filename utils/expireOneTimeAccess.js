export function getOneTimeAccessEndMs(oneTimeAccessUntil) {
  if (!oneTimeAccessUntil) return null;
  if (typeof oneTimeAccessUntil.toDate === 'function') {
    return oneTimeAccessUntil.toDate().getTime();
  }
  const parsed = new Date(oneTimeAccessUntil).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasActiveOneTimeAccess(userData, now = Date.now()) {
  const end = getOneTimeAccessEndMs(userData?.oneTimeAccessUntil);
  return Boolean(end && end > now);
}

export function isOneTimeAccessExpired(userData, now = Date.now()) {
  if (userData?.stripeSubscriptionId) return false;
  const end = getOneTimeAccessEndMs(userData?.oneTimeAccessUntil);
  return Boolean(end && end <= now);
}

export async function archiveEmployerJobs(adminDb, userId) {
  const jobsQuery = await adminDb
    .collection('jobs')
    .where('employerId', '==', userId)
    .get();

  if (jobsQuery.empty) return 0;

  const batch = adminDb.batch();
  let archivedCount = 0;

  jobsQuery.forEach((jobDoc) => {
    if (jobDoc.data().status !== 'archived') {
      batch.update(jobDoc.ref, {
        status: 'archived',
        archivedAt: new Date(),
      });
      archivedCount++;
    }
  });

  if (archivedCount > 0) {
    await batch.commit();
  }

  return archivedCount;
}

export async function reactivateArchivedEmployerJobs(adminDb, userId) {
  const jobsQuery = await adminDb
    .collection('jobs')
    .where('employerId', '==', userId)
    .get();

  if (jobsQuery.empty) return 0;

  const batch = adminDb.batch();
  let reactivatedCount = 0;

  jobsQuery.forEach((jobDoc) => {
    if (jobDoc.data().status === 'archived') {
      batch.update(jobDoc.ref, {
        status: 'active',
        reactivatedAt: new Date(),
      });
      reactivatedCount++;
    }
  });

  if (reactivatedCount > 0) {
    await batch.commit();
  }

  return reactivatedCount;
}

export async function expireOneTimeAccessIfNeeded(adminDb, userId, userData) {
  if (!isOneTimeAccessExpired(userData)) {
    return { expired: false, jobsArchived: 0 };
  }

  const alreadyMarkedExpired =
    userData.subscriptionStatus === 'one_time_expired' ||
    userData.subscriptionStatus === 'expired';

  if (!alreadyMarkedExpired) {
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'expired',
      planId: null,
      subscriptionUpdatedAt: new Date(),
    });
  }

  const jobsArchived = await archiveEmployerJobs(adminDb, userId);

  return { expired: true, jobsArchived, alreadyMarkedExpired };
}
