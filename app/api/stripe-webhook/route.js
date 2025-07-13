import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  // Stripe requires the raw body for signature verification
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("Received Stripe event:", event.type);

  // Handle subscription status changes
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const userId =
      subscription.metadata?.userId ||
      subscription.metadata?.client_reference_id ||
      subscription.client_reference_id;
    const status = subscription.status;

    if (userId) {
      await adminDb
        .collection("users")
        .doc(userId)
        .update({
          subscriptionStatus: status || "cancelled",
          subscriptionUpdatedAt: new Date(),
        });
    }
  } else if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const userId =
      subscription.metadata?.userId ||
      subscription.metadata?.client_reference_id ||
      subscription.client_reference_id;
    const planId = subscription.metadata?.planId || null;
    const status = subscription.status;

    if (userId) {
      await adminDb.collection("users").doc(userId).update({
        subscriptionStatus: status,
        planId: planId,
        subscriptionUpdatedAt: new Date(),
      });
    }
  } else if (event.type === "checkout.session.completed") {
    // No longer create a receipt here for subscriptions
    // Only handle any logic you need for one-time payments if required
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    console.log("invoice", invoice.parent.subscription_details.metadata);
    // userId and planId are set via metadata propagation from the checkout session
    const userId =
      invoice?.parent?.subscription_details?.metadata?.userId || null;
    const planId =
      invoice?.parent?.subscription_details?.metadata?.planId || null;
    const amount = invoice.amount_paid;
    const currency = invoice.currency;
    const receipt_pdf_url = invoice.invoice_pdf || null;
    const created = invoice.created
      ? new Date(invoice.created * 1000)
      : new Date();
    // const sessionId = invoice.subscription || null; // Stripe subscription ID
    const invoiceId = invoice.id;

    if (userId) {
      try {
        await adminDb.collection("receipts").add({
          userId,
          planId,
          amount,
          currency,
          receipt_pdf_url,
          created,
          invoiceId,
          type: "invoice",
        });
        console.log("Invoice receipt successfully written to Firestore");
      } catch (err) {
        console.error("Error writing invoice receipt to Firestore:", err);
      }
    }
  }

  // You can handle other event types here if needed

  return NextResponse.json({ received: true });
}
