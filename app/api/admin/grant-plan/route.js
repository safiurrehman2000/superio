import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import { reactivateArchivedEmployerJobs } from '@/utils/expireOneTimeAccess';

const ACCESS_DURATION_MS = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
  one_time: 30 * 24 * 60 * 60 * 1000,
};

async function resolvePackage(packageId) {
  const byId = await adminDb.collection('pricingPackages').doc(packageId).get();
  if (byId.exists) {
    return { id: byId.id, data: byId.data() };
  }

  const byPrice = await adminDb
    .collection('pricingPackages')
    .where('stripePriceId', '==', packageId)
    .limit(1)
    .get();

  if (!byPrice.empty) {
    const doc = byPrice.docs[0];
    return { id: doc.id, data: doc.data() };
  }

  return null;
}

export async function POST(request) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { userId, packageId } = await request.json();

    if (!userId || !packageId) {
      return NextResponse.json(
        { error: 'userId and packageId are required' },
        { status: 400 },
      );
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
            'This user has a Stripe subscription. Use Change to update it in Stripe, or cancel it first.',
        },
        { status: 400 },
      );
    }

    const pkg = await resolvePackage(packageId);
    if (!pkg) {
      return NextResponse.json(
        { error: 'Pricing package not found' },
        { status: 404 },
      );
    }

    const interval = pkg.data.interval || 'month';
    const accessStart = new Date();
    const durationMs = ACCESS_DURATION_MS[interval] ?? ACCESS_DURATION_MS.month;
    const accessUntil = new Date(accessStart.getTime() + durationMs);

    await adminDb
      .collection('users')
      .doc(userId)
      .update({
        planId: pkg.id,
        subscriptionStatus:
          interval === 'one_time' ? 'one_time_active' : 'admin_active',
        subscriptionStartDate: accessStart,
        subscriptionUpdatedAt: accessStart,
        oneTimePurchaseAt: interval === 'one_time' ? accessStart : null,
        oneTimeAccessUntil: accessUntil,
        adminGrantedAt: accessStart,
      });

    await reactivateArchivedEmployerJobs(adminDb, userId);

    return NextResponse.json({
      success: true,
      packageId: pkg.id,
      packageName: pkg.data.packageType || pkg.data.name,
      interval,
      accessUntil: accessUntil.toISOString(),
    });
  } catch (error) {
    console.error('admin/grant-plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
