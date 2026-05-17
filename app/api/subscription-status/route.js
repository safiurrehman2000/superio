import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";
import {
  expireOneTimeAccessIfNeeded,
  getOneTimeAccessEndMs,
  hasActiveOneTimeAccess,
} from "@/utils/expireOneTimeAccess";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Fetch user to get current subscriptionId
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userData = userDoc.data();
  const { stripeSubscriptionId, oneTimeAccessUntil } = userData;

  try {
    if (!stripeSubscriptionId) {
      if (hasActiveOneTimeAccess(userData)) {
        const oneTimeEnd = getOneTimeAccessEndMs(oneTimeAccessUntil);
        return NextResponse.json({
          active: true,
          status: "one_time_active",
          accessType: "one_time",
          current_period_end: Math.floor(oneTimeEnd / 1000),
          message: "One-time access is active",
          planName: "One-time package",
        });
      }

      await expireOneTimeAccessIfNeeded(adminDb, userId, userData);

      return NextResponse.json({
        active: false,
        message: "No active subscription",
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    );

    const { current_period_end, billing_cycle_anchor, status, plan, items } =
      subscription;
    // Get plan name from items or plan
    let planName =
      plan?.nickname ||
      items?.data?.[0]?.plan?.nickname ||
      plan?.id ||
      items?.data?.[0]?.plan?.id ||
      "";
    // Fallback: if current_period_end is missing, estimate using billing_cycle_anchor + 30 days
    let periodEnd = current_period_end;
    if (!periodEnd && billing_cycle_anchor) {
      periodEnd = billing_cycle_anchor + 30 * 24 * 60 * 60; // 30 days in seconds
    }
    return NextResponse.json({
      active: true,
      current_period_end: periodEnd,
      status,
      accessType: "subscription",
      planName,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
