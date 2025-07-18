import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { priceId, userId, planId } = await request.json();

  try {
    console.log("Creating Stripe session for userId:", userId);
    // Fetch user from Firestore to get existing stripeCustomerId
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const stripeCustomerId = userDoc.exists
      ? userDoc.data().stripeCustomerId
      : null;

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
        trial_period_days: 30,
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
      success_url: `${request.headers.get(
        "origin"
      )}/onboard-order-completed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/onboard-pricing`,
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
    });

    // Fetch the session to get the customer ID
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
    console.log("sessionDetails", sessionDetails);
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
