import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import { deleteCached } from '@/utils/memory-cache';
import { resolveEmployerAccess } from '@/utils/resolveEmployerAccess';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  deleteCached(`subscription-status:${userId}`);

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const access = await resolveEmployerAccess(
      adminDb,
      stripe,
      userId,
      userData,
    );

    if (access.active) {
      return NextResponse.json({
        success: true,
        message: 'Subscription status refreshed successfully',
        accessType: access.accessType,
        subscription: {
          status: access.status,
          planId: access.planId,
          current_period_end: access.current_period_end,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: false,
      message:
        access.message ||
        'No active subscription found. If you just paid, complete checkout again from My Packages or contact support.',
    });
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to refresh subscription status',
        error: error.message,
      },
      { status: 500 },
    );
  }
}
