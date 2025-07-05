import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/utils/firebase";
import { addDoc, collection } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.arrayBuffer();
  const buf = Buffer.from(rawBody);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};

    // Compose receipt data
    const receipt = {
      userId: metadata.userId,
      packageName: metadata.packageName,
      packageId: metadata.packageId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      createdAt: new Date().toISOString(),
      receiptId: `REC-${Date.now()}-${
        (metadata.userId || "").slice(-4) || "anon"
      }`,
    };

    // Save to Firestore
    try {
      await addDoc(collection(db, "receipts"), receipt);
      console.log("Receipt saved:", receipt);
    } catch (err) {
      console.error("Error saving receipt:", err);
      return NextResponse.json(
        { error: "Failed to save receipt" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
