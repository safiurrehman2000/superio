import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { priceId, userId, planId, source } = await request.json();

  try {
    console.log("Creating Stripe session for userId:", userId);
    // Fetch user from Firestore to get existing stripeCustomerId and hasUsedTrial
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const stripeCustomerId = userDoc.exists
      ? userDoc.data().stripeCustomerId
      : null;
    const hasUsedTrial = userDoc.exists ? userDoc.data().hasUsedTrial : false;
    const origin = request.headers.get("origin");
    const isOnboarding = source === "onboarding";
    const successUrl = isOnboarding
      ? `${origin}/onboard-order-completed?session_id={CHECKOUT_SESSION_ID}&source=onboarding`
      : `${origin}/success?session_id={CHECKOUT_SESSION_ID}&source=pricing`;
    const cancelUrl = isOnboarding
      ? `${origin}/onboard-pricing`
      : `${origin}/employers-dashboard/packages`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(hasUsedTrial ? {} : { trial_period_days: 30 }),
        metadata: {
          userId,
          planId,
        },
      },
      client_reference_id: userId, // your user ID
      metadata: {
        userId, // your user ID from your DB
        planId, // your plan ID from your DB
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
    });

    // Fetch the session to get the customer ID
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
    if (sessionDetails.customer) {
      await adminDb.collection("users").doc(userId).update({
        stripeCustomerId: sessionDetails.customer,
      });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
