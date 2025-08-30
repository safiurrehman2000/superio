import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { priceId, userId, planId, source } = body;

    console.log("Creating Stripe session for userId:", userId);
    console.log("Price ID:", priceId, "Plan ID:", planId, "Source:", source);

    // Validate required fields
    if (!priceId || !userId || !planId) {
      console.error("Missing required fields:", { priceId, userId, planId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Stripe configuration error" },
        { status: 500 }
      );
    }

    // Fetch user from Firestore to get existing stripeCustomerId and hasUsedTrial
    let userDoc;
    try {
      userDoc = await adminDb.collection("users").doc(userId).get();
    } catch (firebaseError) {
      console.error("Firebase error:", firebaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

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

    console.log("Creating Stripe session with URLs:", {
      successUrl,
      cancelUrl,
    });

    // Validate that the price exists
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log("Price validation successful:", {
        priceId: price.id,
        active: price.active,
        nickname: price.nickname,
        unitAmount: price.unit_amount,
      });

      if (!price.active) {
        return NextResponse.json(
          { error: "Price is not active" },
          { status: 400 }
        );
      }
    } catch (priceError) {
      console.error("Price validation failed:", priceError);
      return NextResponse.json(
        { error: `Invalid price ID: ${priceError.message}` },
        { status: 400 }
      );
    }

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

    console.log("Stripe session created successfully:", session.id);

    // Fetch the session to get the customer ID
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);
    if (sessionDetails.customer) {
      await adminDb.collection("users").doc(userId).update({
        stripeCustomerId: sessionDetails.customer,
      });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Detailed error in create-checkout-session:", {
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });

    // Return more specific error messages based on error type
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: `Invalid request: ${error.message}` },
        { status: 400 }
      );
    } else if (error.type === "StripeAuthenticationError") {
      return NextResponse.json(
        { error: "Stripe authentication failed" },
        { status: 500 }
      );
    } else if (error.type === "StripePermissionError") {
      return NextResponse.json(
        { error: "Stripe permission denied" },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: `Error creating checkout session: ${error.message}` },
        { status: 500 }
      );
    }
  }
}
