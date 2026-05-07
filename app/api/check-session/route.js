import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { sessionId } = await request.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userId = session.client_reference_id;
      const planId = session.metadata?.planId || null;

      if (session.mode === "payment") {
        const accessStart = new Date();
        const accessUntil = new Date(
          accessStart.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "one_time_active",
          planId,
          subscriptionUpdatedAt: accessStart,
          subscriptionStartDate: accessStart,
          oneTimePurchaseAt: accessStart,
          oneTimeAccessUntil: accessUntil,
        });
      } else {
        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          planId,
          subscriptionUpdatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
