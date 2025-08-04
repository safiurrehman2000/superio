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
    // Fetch user to get current subscriptionId
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const { stripeSubscriptionId, planId } = userData;

    if (!stripeSubscriptionId) {
      return NextResponse.json({
        jobLimit: 0,
        jobsPosted: 0,
        remainingJobs: 0,
        message: "No active subscription",
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    );
    const stripePriceId = subscription.items.data[0]?.price?.id;

    // Get the pricing package that matches this Stripe price
    let jobLimit = 0;
    if (stripePriceId) {
      const packagesRef = adminDb.collection("pricingPackages");
      const pkgQuery = await packagesRef
        .where("stripePriceId", "==", stripePriceId)
        .get();

      if (!pkgQuery.empty) {
        const packageData = pkgQuery.docs[0].data();
        // Extract job limit from features or use a default mapping
        jobLimit = extractJobLimitFromPackage(packageData);
      }
    }

    // If we couldn't find the package by stripePriceId, try using planId
    if (jobLimit === 0 && planId) {
      const packageRef = adminDb.collection("pricingPackages").doc(planId);
      const packageDoc = await packageRef.get();

      if (packageDoc.exists) {
        const packageData = packageDoc.data();
        jobLimit = extractJobLimitFromPackage(packageData);
      }
    }

    // Count current active jobs for this user
    const jobsQuery = await adminDb
      .collection("jobs")
      .where("employerId", "==", userId)
      .where("status", "==", "active")
      .get();

    // Get user's subscription start date to determine which jobs to count
    const subscriptionStartDate =
      userData.subscriptionStartDate || userData.subscriptionUpdatedAt;

    let jobsPosted = 0;

    if (subscriptionStartDate) {
      // Only count jobs posted AFTER the current subscription started
      const subscriptionStartTime = subscriptionStartDate.toDate
        ? subscriptionStartDate.toDate()
        : new Date(subscriptionStartDate);

      jobsQuery.forEach((jobDoc) => {
        const jobData = jobDoc.data();
        const jobCreatedAt = jobData.createdAt
          ? new Date(jobData.createdAt)
          : new Date(0);

        // Only count jobs created after the subscription started
        if (jobCreatedAt >= subscriptionStartTime) {
          jobsPosted++;
        }
      });
    } else {
      // Fallback: count all active jobs if no subscription start date
      jobsPosted = jobsQuery.size;
    }

    const remainingJobs = Math.max(0, jobLimit - jobsPosted);

    return NextResponse.json({
      jobLimit,
      jobsPosted,
      remainingJobs,
      planId,
      stripePriceId,
    });
  } catch (error) {
    console.error("Error fetching job posting limits:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to extract job limit from package data
function extractJobLimitFromPackage(packageData) {
  // First try to get from jobPosts field if it exists
  if (packageData.jobPosts) {
    return parseInt(packageData.jobPosts);
  }

  // Extract from features array (e.g., "30 job posting" -> 30)
  if (packageData.features && Array.isArray(packageData.features)) {
    for (const feature of packageData.features) {
      const match = feature.match(/(\d+)\s+job\s+posting/i);
      if (match) {
        return parseInt(match[1]);
      }
    }
  }

  // Default mapping based on package type
  const packageType = packageData.packageType?.toLowerCase();
  switch (packageType) {
    case "basic":
      return 30;
    case "standard":
      return 40;
    case "extended":
      return 50;
    default:
      return 0; // No subscription or unknown package
  }
}
