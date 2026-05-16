import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import '@/utils/firebase-admin';
import admin from 'firebase-admin';
import { ensureReceiptFromCompletedCheckoutSession } from '@/utils/stripeReceiptSync';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const runtime = 'nodejs';

/**
 * Idempotent receipt sync after Checkout redirect — fills the gap when Stripe webhooks
 * do not reach localhost (use Stripe CLI in prod-like setups, or this route from /success).
 */
export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sessionId = body?.sessionId;
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription.latest_invoice', 'customer', 'customer.tax_ids'],
    });
  } catch {
    return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 });
  }

  const ownerId =
    session.metadata?.userId || session.client_reference_id || null;
  if (!ownerId || ownerId !== uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await ensureReceiptFromCompletedCheckoutSession(
      stripe,
      sessionId,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error('sync-checkout-receipt:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || 'Sync failed',
      },
      { status: 500 },
    );
  }
}
