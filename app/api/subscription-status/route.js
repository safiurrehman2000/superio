import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";
import {
  expireOneTimeAccessIfNeeded,
  getOneTimeAccessEndMs,
  hasActiveOneTimeAccess,
} from "@/utils/expireOneTimeAccess";
import { getCached, setCached } from "@/utils/memory-cache";
import {
  isFirestoreQuotaError,
  quotaExceededResponse,
} from "@/utils/firestore-errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CACHE_TTL_MS = 60_000;

export async function POST(request) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const cacheKey = `subscription-status:${userId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  let userDoc;
  try {
    userDoc = await adminDb.collection("users").doc(userId).get();
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    throw error;
  }

  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userData = userDoc.data();
  const { stripeSubscriptionId, oneTimeAccessUntil } = userData;

  try {
    let payload;

    if (!stripeSubscriptionId) {
      if (hasActiveOneTimeAccess(userData)) {
        const oneTimeEnd = getOneTimeAccessEndMs(oneTimeAccessUntil);
        const status = userData.subscriptionStatus || "one_time_active";
        let planName = "One-time package";
        if (userData.planId) {
          const pkgDoc = await adminDb
            .collection("pricingPackages")
            .doc(userData.planId)
            .get();
          if (pkgDoc.exists) {
            const pkg = pkgDoc.data();
            planName = pkg.packageType || pkg.name || planName;
          }
        }
        payload = {
          active: true,
          status,
          accessType: status === "admin_active" ? "admin" : "one_time",
          current_period_end: Math.floor(oneTimeEnd / 1000),
          message: "Plan access is active",
          planName,
        };
      } else {
        await expireOneTimeAccessIfNeeded(adminDb, userId, userData);

        payload = {
          active: false,
          message: "No active subscription",
        };
      }
    } else {
      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId,
      );

      const { current_period_end, billing_cycle_anchor, status, plan, items } =
        subscription;
      let planName =
        plan?.nickname ||
        items?.data?.[0]?.plan?.nickname ||
        plan?.id ||
        items?.data?.[0]?.plan?.id ||
        "";
      let periodEnd = current_period_end;
      if (!periodEnd && billing_cycle_anchor) {
        periodEnd = billing_cycle_anchor + 30 * 24 * 60 * 60;
      }

      if (periodEnd && periodEnd !== userData.subscriptionPeriodEnd) {
        await adminDb.collection("users").doc(userId).update({
          subscriptionPeriodEnd: periodEnd,
        });
      }

      payload = {
        active: true,
        current_period_end: periodEnd,
        status,
        accessType: "subscription",
        planName,
      };
    }

    setCached(cacheKey, payload, CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
