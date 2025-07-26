import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId, action, newPlanId } = await request.json();

  // Fetch user to get current subscriptionId
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userData = userDoc.data();
  const { stripeSubscriptionId, stripeCustomerId } = userData;

  try {
    if (action === "cancel") {
      if (!stripeSubscriptionId) {
        return NextResponse.json(
          { error: "No active subscription to cancel" },
          { status: 400 }
        );
      }

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
    } else if (action === "change") {
      if (!stripeSubscriptionId) {
        return NextResponse.json(
          { error: "No active subscription to change" },
          { status: 400 }
        );
      }

      // Get the subscription to find the current item
      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      );
      const currentItemId = subscription.items.data[0].id;

      // Update the subscription to the new price
      await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{ id: currentItemId, price: newPlanId }],
        proration_behavior: "create_prorations",
      });

      return NextResponse.json({ success: true });
    } else if (action === "set") {
      if (!stripeCustomerId) {
        return NextResponse.json(
          { error: "User has no Stripe customer ID" },
          { status: 400 }
        );
      }

      // Create a new subscription for the user
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: newPlanId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      // Update user with new subscription details
      await adminDb.collection("users").doc(userId).update({
        stripeSubscriptionId: subscription.id,
        planId: newPlanId,
        subscriptionStatus: "active",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
