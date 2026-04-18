import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebase-admin';
import { buildBrandedReceiptPdfForInvoice } from '@/utils/buildBrandedReceiptPdfForInvoice';
import { uploadBrandedReceiptPdf } from '@/utils/uploadBrandedReceiptPdf';

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
    // No longer create a receipt here for subscriptions
    // Only handle any logic you need for one-time payments if required
  } else if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    console.log('invoice', invoice.parent?.subscription_details?.metadata);
    let userId =
      invoice?.parent?.subscription_details?.metadata?.userId || null;
    let planId =
      invoice?.parent?.subscription_details?.metadata?.planId || null;

    const subscriptionRef = invoice.subscription;
    const subscriptionId =
      typeof subscriptionRef === 'string'
        ? subscriptionRef
        : subscriptionRef?.id || null;

    if ((!userId || !planId) && subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        userId = userId || sub.metadata?.userId || null;
        planId = planId || sub.metadata?.planId || null;
      } catch (e) {
        console.error(
          'Could not retrieve subscription for invoice metadata:',
          e,
        );
      }
    }

    if (!userId && invoice.customer) {
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
      if (customerId) {
        const employerQuery = await adminDb
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        if (!employerQuery.empty) {
          userId = employerQuery.docs[0].id;
        }
      }
    }

    const amount = invoice.amount_paid;
    const currency = invoice.currency;
    const stripe_invoice_pdf_url = invoice.invoice_pdf || null;
    const created = invoice.created
      ? new Date(invoice.created * 1000)
      : new Date();
    const invoiceId = invoice.id;

    if (userId) {
      let receipt_pdf_url = stripe_invoice_pdf_url;

      if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        try {
          const pdfBuffer = await buildBrandedReceiptPdfForInvoice(
            invoice,
            planId,
            userId,
          );
          receipt_pdf_url = await uploadBrandedReceiptPdf({
            userId,
            invoiceId,
            pdfBuffer,
          });
        } catch (err) {
          console.error(
            'Branded receipt PDF failed, using Stripe invoice PDF if available:',
            err,
          );
          receipt_pdf_url = stripe_invoice_pdf_url;
        }
      }

      try {
        await adminDb.collection('receipts').add({
          userId,
          planId,
          amount,
          currency,
          receipt_pdf_url,
          stripe_invoice_pdf_url,
          created,
          invoiceId,
          type: 'invoice',
        });
        console.log('Invoice receipt successfully written to Firestore');
      } catch (err) {
        console.error('Error writing invoice receipt to Firestore:', err);
      }
    }
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
