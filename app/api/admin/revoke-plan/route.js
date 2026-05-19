import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import { archiveEmployerJobs } from '@/utils/expireOneTimeAccess';

/**
 * POST /api/admin/revoke-plan
 * Remove admin-granted or one-time access (no Stripe call).
 */
export async function POST(request) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (userData.stripeSubscriptionId) {
      return NextResponse.json(
        {
          error:
            'This user has a Stripe subscription. Use Cancel in the admin table to cancel in Stripe.',
        },
        { status: 400 },
      );
    }

    const hadAccess =
      userData.oneTimeAccessUntil ||
      ['one_time_active', 'admin_active'].includes(userData.subscriptionStatus);

    if (!hadAccess) {
      return NextResponse.json(
        { error: 'User has no active plan access to revoke' },
        { status: 400 },
      );
    }

    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'expired',
      planId: null,
      oneTimeAccessUntil: null,
      subscriptionUpdatedAt: new Date(),
    });

    const jobsArchived = await archiveEmployerJobs(adminDb, userId);

    return NextResponse.json({
      success: true,
      jobsArchived,
    });
  } catch (error) {
    console.error('admin/revoke-plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
