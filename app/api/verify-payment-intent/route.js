import { NextResponse } from "next/server";
import Stripe from "stripe";

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
          verified: false,
        },
        { status: 500 }
      );
    }

    const { paymentIntentId, clientSecret } = await request.json();

    if (!paymentIntentId || !clientSecret) {
      return NextResponse.json(
        {
          error: "Payment intent ID and client secret are required",
          verified: false,
        },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify that the client secret matches
    if (paymentIntent.client_secret !== clientSecret) {
      return NextResponse.json(
        {
          error: "Invalid client secret",
          verified: false,
        },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (paymentIntent.status === "succeeded") {
      return NextResponse.json({
        verified: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });
    } else {
      return NextResponse.json({
        verified: false,
        status: paymentIntent.status,
        error: "Payment was not successful",
      });
    }
  } catch (error) {
    console.error("Error verifying payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment intent",
        details: error.message,
        verified: false,
      },
      { status: 500 }
    );
  }
}
