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
    const snapshot = await adminDb
      .collection('users')
      .where('subscriptionStatus', '==', 'one_time_active')
      .get();

    let usersExpired = 0;
    let totalJobsArchived = 0;

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
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
