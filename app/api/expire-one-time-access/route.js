import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebase-admin';
import {
  expireOneTimeAccessIfNeeded,
  getOneTimeAccessEndMs,
} from '@/utils/expireOneTimeAccess';

export const runtime = 'nodejs';

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = Date.now();
    const statuses = ['one_time_active', 'admin_active'];
    const seen = new Set();
    let usersExpired = 0;
    let totalJobsArchived = 0;

    for (const status of statuses) {
      const snapshot = await adminDb
        .collection('users')
        .where('subscriptionStatus', '==', status)
        .get();

      for (const userDoc of snapshot.docs) {
        if (seen.has(userDoc.id)) continue;
        seen.add(userDoc.id);

        const userData = userDoc.data();
        if (userData.stripeSubscriptionId) continue;

        const end = getOneTimeAccessEndMs(userData.oneTimeAccessUntil);
        if (!end || end > now) continue;

        const result = await expireOneTimeAccessIfNeeded(
          adminDb,
          userDoc.id,
          userData,
        );
        if (result.expired) {
          usersExpired++;
          totalJobsArchived += result.jobsArchived;
        }
      }
    }

    return NextResponse.json({
      success: true,
      usersExpired,
      jobsArchived: totalJobsArchived,
    });
  } catch (error) {
    console.error('expire-one-time-access cron failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
