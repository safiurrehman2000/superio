import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import {
  processOneTimeCheckoutReceipt,
  processPaidInvoiceReceipt,
} from '@/utils/stripeReceiptSync';
import { reactivateArchivedEmployerJobs } from '@/utils/expireOneTimeAccess';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const runtime = 'nodejs';

export async function POST(request) {
  // Stripe requires the raw body for signature verification
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  console.log('Received Stripe event:', event.type);

  // Handle subscription status changes
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    console.log('subscription', subscription);
    let userId =
      subscription.metadata?.userId ||
      subscription.metadata?.client_reference_id ||
      subscription.client_reference_id;
    console.log('userId', userId);
    const status = subscription.status;
    const customerId = subscription.customer;
    console.log('customerId', customerId);
    if (customerId) {
      const usersRef = adminDb.collection('users');
      const employerQuery = await usersRef
        .where('stripeCustomerId', '==', customerId)
        .get();

      console.log('employerQuery', employerQuery.docs);
      if (!employerQuery.empty) {
        userId = employerQuery.docs[0].id;
      }
    }

    if (userId) {
      await adminDb
        .collection('users')
        .doc(userId)
        .update({
          subscriptionStatus: status || 'cancelled',
          subscriptionUpdatedAt: new Date(),
          planId: null, // Clear planId on cancellation
        });
      // Archive all jobs for this employer

      const jobsQuery = await adminDb
        .collection('jobs')
        .where('employerId', '==', userId)
        .get();
      console.log('jobsQuery', jobsQuery);
      const batch = adminDb.batch();
      jobsQuery.forEach((jobDoc) => {
        batch.update(jobDoc.ref, {
          status: 'archived',
          archivedAt: new Date(),
        });
      });
      await batch.commit();
    }
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    let userId =
      subscription.metadata?.userId ||
      subscription.metadata?.client_reference_id ||
      subscription.client_reference_id;
    const stripePriceId = subscription.items.data[0]?.price?.id || null;
    let planId = null;
    if (stripePriceId) {
      const packagesRef = adminDb.collection('pricingPackages');
      const pkgQuery = await packagesRef
        .where('stripePriceId', '==', stripePriceId)
        .get();
      if (!pkgQuery.empty) {
        const pkgDoc = pkgQuery.docs[0];
        const pkgData = pkgDoc.data();
        planId = pkgData?.id ?? pkgDoc.id ?? null;
      }
    }
    console.log('planId is set', planId);
    const status = subscription.status;
    const customerId = subscription.customer;

    // Fallback: If userId is not present, look up by Stripe customer ID
    if (!userId && customerId) {
      const usersRef = adminDb.collection('users');
      const employerQuery = await usersRef
        .where('stripeCustomerId', '==', customerId)
        .get();
      if (!employerQuery.empty) {
        userId = employerQuery.docs[0].id;
      }
    }

    if (userId) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      const prevPlanId = userSnap.exists ? userSnap.data().planId : null;

      await adminDb
        .collection('users')
        .doc(userId)
        .update({
          subscriptionStatus: status,
          planId: ['canceled', 'incomplete_expired'].includes(status)
            ? null
            : (planId ?? null),
          subscriptionUpdatedAt: new Date(),
          ...(planId &&
            planId !== prevPlanId && {
              subscriptionStartDate: new Date(),
            }),
        });
      console.log(
        'Updated subscription for user',
        userId,
        'status:',
        status,
        'planId:',
        planId,
      );
      // Archive all jobs if subscription is canceled or incomplete_expired
      if (['canceled', 'incomplete_expired'].includes(status)) {
        const jobsQuery = await adminDb
          .collection('jobs')
          .where('employerId', '==', userId)
          .get();
        const batch = adminDb.batch();
        jobsQuery.forEach((jobDoc) => {
          batch.update(jobDoc.ref, {
            status: 'archived',
            archivedAt: new Date(),
          });
        });
        await batch.commit();
      } else {
        // Reactivate archived jobs on subscription reactivation/change
        const jobsQuery = await adminDb
          .collection('jobs')
          .where('employerId', '==', userId)
          .get();
        const batch = adminDb.batch();
        jobsQuery.forEach((jobDoc) => {
          if (jobDoc.data().status === 'archived') {
            batch.update(jobDoc.ref, {
              status: 'active',
              reactivatedAt: new Date(),
            });
          }
        });
        await batch.commit();
      }
    }
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId =
      session.metadata?.userId || session.client_reference_id || null;
    const customerId = session.customer;
    const planId = session.metadata?.planId || null;

    if (userId && customerId) {
      // Fetch user doc
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists && !userDoc.data().stripeCustomerId) {
        await adminDb.collection('users').doc(userId).update({
          stripeCustomerId: customerId,
        });
        // Patch any missing subscriptionId
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 1,
        });
        if (subscriptions.data.length > 0) {
          const latestSub = subscriptions.data[0];
          await adminDb.collection('users').doc(userId).update({
            stripeSubscriptionId: latestSub.id,
          });
          console.log(
            'Patched missing stripeSubscriptionId for user (via checkout.session.completed)',
            userId,
            latestSub.id,
          );
        }
      }
    }

    if (
      userId &&
      session.mode === 'payment' &&
      session.payment_status === 'paid'
    ) {
      const accessStart = new Date();
      const accessUntil = new Date(
        accessStart.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      await adminDb.collection('users').doc(userId).set(
        {
          subscriptionStatus: 'one_time_active',
          planId,
          subscriptionUpdatedAt: accessStart,
          subscriptionStartDate: accessStart,
          oneTimePurchaseAt: accessStart,
          oneTimeAccessUntil: accessUntil,
          isFirstTime: false,
        },
        { merge: true },
      );

      try {
        await processOneTimeCheckoutReceipt(stripe, session);
      } catch (e) {
        console.error('checkout.session.completed: one-time receipt failed', e);
      }

      await reactivateArchivedEmployerJobs(adminDb, userId);
    }
  } else if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    console.log(
      'invoice',
      event.type,
      invoice.parent?.subscription_details?.metadata,
    );
    await processPaidInvoiceReceipt(stripe, invoice);
  } else if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    console.log('subscription in subscription created', subscription.id);
    console.log('subscription.customer', subscription.customer);
    const subscriptionId = subscription.id; // Stripe subscription ID
    const customerId = subscription.customer;
    const status = subscription.status;

    // Find the user by stripeCustomerId
    const usersRef = adminDb.collection('users');
    const employerQuery = await usersRef
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (!employerQuery.empty) {
      const userId = employerQuery.docs[0].id;
      const stripePriceId = subscription.items.data[0]?.price?.id || null;
      let planId = null;
      if (stripePriceId) {
        const packagesRef = adminDb.collection('pricingPackages');
        const pkgQuery = await packagesRef
          .where('stripePriceId', '==', stripePriceId)
          .get();
        if (!pkgQuery.empty) {
          const pkgDoc = pkgQuery.docs[0];
          const pkgData = pkgDoc.data();
          planId = pkgData?.id ?? pkgDoc.id ?? null;
        }
      }

      // Update user with subscription details
      await adminDb
        .collection('users')
        .doc(userId)
        .update({
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: status,
          planId: planId ?? null,
          subscriptionUpdatedAt: new Date(), // This resets the job count
          subscriptionStartDate: new Date(), // Track when this subscription started
          isFirstTime: false, // Mark onboarding as complete after subscription
        });
      console.log(
        'stripeSubscriptionId and planId set for user',
        userId,
        subscriptionId,
        planId,
      );

      // Reactivate archived jobs on new subscription
      if (!['canceled', 'incomplete_expired'].includes(status)) {
        const jobsQuery = await adminDb
          .collection('jobs')
          .where('employerId', '==', userId)
          .get();
        const batch = adminDb.batch();
        jobsQuery.forEach((jobDoc) => {
          if (jobDoc.data().status === 'archived') {
            batch.update(jobDoc.ref, {
              status: 'active',
              reactivatedAt: new Date(),
            });
          }
        });
        await batch.commit();
      }
    } else {
      // Fallback: user not found, log for retry/manual patch
      console.warn(
        `No user found with stripeCustomerId ${customerId} for subscription ${subscriptionId}. Will need to patch this user later.`,
      );
      // Optionally, you could queue a retry here or write to a 'failedEvents' collection for later processing
    }
  } else if (event.type === 'customer.created') {
    const customer = event.data.object;
    const customerId = customer.id;
    // Try to get userId from metadata or client_reference_id if available (rare, but possible if you create customers directly with metadata)
    const userId =
      customer.metadata?.userId || customer.client_reference_id || null;
    if (userId) {
      // Set stripeCustomerId on user doc
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists && !userDoc.data().stripeCustomerId) {
        await adminDb.collection('users').doc(userId).update({
          stripeCustomerId: customerId,
        });
        console.log(
          'stripeCustomerId set for user (via customer.created)',
          userId,
          customerId,
        );
        // Patch any missing subscriptionId
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 1,
        });
        if (subscriptions.data.length > 0) {
          const latestSub = subscriptions.data[0];
          await adminDb.collection('users').doc(userId).update({
            stripeSubscriptionId: latestSub.id,
          });
          console.log(
            'Patched missing stripeSubscriptionId for user (via customer.created)',
            userId,
            latestSub.id,
          );
        }
      }
    }
  }

  // You can handle other event types here if needed

  return NextResponse.json({ received: true });
}
