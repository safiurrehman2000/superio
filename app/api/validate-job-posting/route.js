import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId, jobData } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Fetch user to get current subscriptionId
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        {
          canPost: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const { stripeSubscriptionId, planId } = userData;

    // Check if user has active subscription
    if (!stripeSubscriptionId) {
      return NextResponse.json({
        canPost: false,
        message:
          "You need an active subscription to post jobs. Please subscribe to a plan first.",
      });
    }

    // Verify subscription is active in Stripe and get job posting limits
    let subscription;
    let stripePriceId;

    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      if (
        subscription.status !== "active" &&
        subscription.status !== "trialing"
      ) {
        return NextResponse.json({
          canPost: false,
          message:
            "Your subscription is not active. Please check your subscription status.",
        });
      }
      stripePriceId = subscription.items.data[0]?.price?.id;
    } catch (stripeError) {
      console.error("Stripe subscription error:", stripeError);
      return NextResponse.json({
        canPost: false,
        message:
          "Unable to verify subscription status. Please contact support.",
      });
    }
    let jobLimit = 0;

    if (stripePriceId) {
      const packagesRef = adminDb.collection("pricingPackages");
      const pkgQuery = await packagesRef
        .where("stripePriceId", "==", stripePriceId)
        .get();

      if (!pkgQuery.empty) {
        const packageData = pkgQuery.docs[0].data();
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

    if (remainingJobs <= 0) {
      return NextResponse.json({
        canPost: false,
        message: `You have reached your job posting limit (${jobLimit} jobs). Please upgrade your subscription to post more jobs.`,
        jobLimit,
        jobsPosted,
        remainingJobs,
      });
    }

    return NextResponse.json({
      canPost: true,
      message: `You can post ${remainingJobs} more job(s) with your current subscription.`,
      jobLimit,
      jobsPosted,
      remainingJobs,
    });
  } catch (error) {
    console.error("Error validating job posting:", error);
    return NextResponse.json(
      {
        canPost: false,
        message: "Failed to validate job posting permission",
      },
      { status: 500 }
    );
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
