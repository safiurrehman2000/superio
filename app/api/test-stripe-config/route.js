import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

export async function GET() {
  try {
    const config = {
      stripe: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        secretKeyLength: process.env.STRIPE_SECRET_KEY
          ? process.env.STRIPE_SECRET_KEY.length
          : 0,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },
      firebase: {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.length
          : 0,
      },
    };

    // Test Stripe connection
    let stripeTest = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // Try to list prices to test connection
        const prices = await stripe.prices.list({ limit: 1 });
        stripeTest = {
          success: true,
          pricesCount: prices.data.length,
        };
      } catch (stripeError) {
        stripeTest = {
          success: false,
          error: stripeError.message,
          type: stripeError.type,
        };
      }
    }

    // Test Firebase connection
    let firebaseTest = null;
    try {
      // Try to access a collection to test connection
      const testQuery = await adminDb.collection("users").limit(1).get();
      firebaseTest = {
        success: true,
        docsCount: testQuery.size,
      };
    } catch (firebaseError) {
      firebaseTest = {
        success: false,
        error: firebaseError.message,
      };
    }

    return NextResponse.json({
      config,
      stripeTest,
      firebaseTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
