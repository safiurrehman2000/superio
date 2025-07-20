import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId, newPriceId, cancel } = await request.json();

  // Fetch user to get current subscriptionId
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const { stripeSubscriptionId } = userDoc.data();
  if (!stripeSubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 }
    );
  }

  try {
    if (cancel) {
      if (typeof stripe.subscriptions.cancel === "function") {
        await stripe.subscriptions.cancel(stripeSubscriptionId);
      } else if (typeof stripe.subscriptions.del === "function") {
        await stripe.subscriptions.del(stripeSubscriptionId);
      } else {
        throw new Error(
          "Stripe subscription cancellation method not found. Please check your Stripe SDK version."
        );
      }
      await adminDb.collection("users").doc(userId).update({
        subscriptionStatus: "canceled",
        planId: null,
        stripeSubscriptionId: null,
      });
      return NextResponse.json({ success: true, cancelled: true });
    } else {
      // Get the subscription to find the current item
      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      );
      const currentItemId = subscription.items.data[0].id;

      // Update the subscription to the new price
      await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{ id: currentItemId, price: newPriceId }],
        proration_behavior: "create_prorations",
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
