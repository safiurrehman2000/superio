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
          details:
            "Add STRIPE_SECRET_KEY=sk_test_your_secret_key_here to .env.local",
        },
        { status: 500 }
      );
    }

    const { amount, currency = "eur", metadata = {} } = await request.json();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents (Stripe expects amounts in smallest currency unit)
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
