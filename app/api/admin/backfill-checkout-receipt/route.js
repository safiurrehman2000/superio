import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import {
  backfillCheckoutReceiptsForUser,
  createMissingOneTimeReceiptFromUserAccess,
} from '@/utils/stripeReceiptSync';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function resolveUserId({ userId, email }) {
  if (userId) {
    return userId;
  }
  if (!email) {
    return null;
  }
  const snap = await adminDb
    .collection('users')
    .where('email', '==', email.trim().toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) {
    return null;
  }
  return snap.docs[0].id;
}

export async function POST(request) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const resolvedUserId = await resolveUserId({
      userId: body?.userId,
      email: body?.email,
    });

    if (!resolvedUserId) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    const stripeResult = await backfillCheckoutReceiptsForUser(
      stripe,
      resolvedUserId,
    );

    let accessResult = null;
    if (body?.fromAccess) {
      accessResult = await createMissingOneTimeReceiptFromUserAccess(
        resolvedUserId,
      );
    }

    return Response.json({
      success: true,
      userId: resolvedUserId,
      stripe: stripeResult,
      fromAccess: accessResult,
    });
  } catch (error) {
    console.error('admin/backfill-checkout-receipt error:', error);
    return Response.json(
      { success: false, error: error.message || 'Backfill failed' },
      { status: 500 },
    );
  }
}
