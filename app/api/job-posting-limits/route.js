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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
        jobLimit: 0,
        jobsPosted: 0,
        remainingJobs: 0,
        message: result.message || 'No active subscription',
      });
    }

    const { active: _active, canPost: _canPost, message: _message, ...limits } =
      result;

    return NextResponse.json(limits);
  } catch (error) {
    console.error('Error fetching job posting limits:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
