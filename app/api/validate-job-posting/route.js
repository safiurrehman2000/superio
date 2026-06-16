import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import { expireOneTimeAccessIfNeeded } from '@/utils/expireOneTimeAccess';
import { computeJobPostingLimits } from '@/utils/computeJobPostingLimits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        {
          canPost: false,
          message: 'User not found',
        },
        { status: 404 },
      );
    }

    const userData = userDoc.data();
    const result = await computeJobPostingLimits(
      adminDb,
      stripe,
      userId,
      userData,
    );

    if (!result.active) {
      await expireOneTimeAccessIfNeeded(adminDb, userId, userData);
      return NextResponse.json({
        canPost: false,
        message:
          'You need an active subscription to post jobs. Please subscribe to a plan first.',
      });
    }

    return NextResponse.json({
      canPost: result.canPost,
      message: result.message,
      jobLimit: result.jobLimit,
      jobsPosted: result.jobsPosted,
      remainingJobs: result.remainingJobs,
      accessType: result.accessType,
      oneTimeAccessUntil: result.oneTimeAccessUntil,
    });
  } catch (error) {
    console.error('Error validating job posting:', error);
    return NextResponse.json(
      {
        canPost: false,
        message: 'Failed to validate job posting permission',
      },
      { status: 500 },
    );
  }
}
