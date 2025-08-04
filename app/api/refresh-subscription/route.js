import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Get user document
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const { stripeSubscriptionId, stripeCustomerId } = userData;

    if (!stripeSubscriptionId && !stripeCustomerId) {
      return NextResponse.json({
        success: false,
        message: "No subscription found for user",
      });
    }

    let subscription = null;
    let updatedData = {};

    // Try to get subscription by subscription ID first
    if (stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          stripeSubscriptionId
        );
        console.log("Found subscription by ID:", subscription.id);
      } catch (error) {
        console.log("Subscription not found by ID, trying customer lookup");
      }
    }

    // If no subscription found by ID, try to find by customer ID
    if (!subscription && stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "all",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          subscription = subscriptions.data[0];
          console.log("Found subscription by customer ID:", subscription.id);
        }
      } catch (error) {
        console.error("Error finding subscription by customer ID:", error);
      }
    }

    if (subscription) {
      const status = subscription.status;
      const stripePriceId = subscription.items.data[0]?.price?.id || null;
      let planId = null;

      // Find matching pricing package
      if (stripePriceId) {
        const packagesRef = adminDb.collection("pricingPackages");
        const pkgQuery = await packagesRef
          .where("stripePriceId", "==", stripePriceId)
          .get();

        if (!pkgQuery.empty) {
          planId = pkgQuery.docs[0].data().id;
          console.log("Found plan ID:", planId);
        }
      }

      // Update user document with fresh subscription data
      updatedData = {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: status,
        planId: ["canceled", "incomplete_expired"].includes(status)
          ? null
          : planId,
        subscriptionUpdatedAt: new Date(),
        // If this is a new plan (different from current), reset the start date
        ...(planId &&
          planId !== userData.planId && {
            subscriptionStartDate: new Date(),
          }),
      };

      await adminDb.collection("users").doc(userId).update(updatedData);

      return NextResponse.json({
        success: true,
        message: "Subscription status refreshed successfully",
        subscription: {
          id: subscription.id,
          status: status,
          planId: planId,
          updatedAt: new Date(),
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No active subscription found in Stripe",
      });
    }
  } catch (error) {
    console.error("Error refreshing subscription status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh subscription status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
