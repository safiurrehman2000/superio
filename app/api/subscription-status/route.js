import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/utils/firebase-admin";
import { expireOneTimeAccessIfNeeded } from "@/utils/expireOneTimeAccess";
import { getCached, setCached } from "@/utils/memory-cache";
import { resolveEmployerAccess } from "@/utils/resolveEmployerAccess";
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

  try {
    const access = await resolveEmployerAccess(
      adminDb,
      stripe,
      userId,
      userData,
    );

    let payload;

    if (access.active) {
      payload = {
        active: true,
        current_period_end: access.current_period_end,
        status: access.status,
        accessType: access.accessType,
        planName: access.planName,
        planId: access.planId,
        message: "Plan access is active",
      };
    } else {
      await expireOneTimeAccessIfNeeded(adminDb, userId, userData);
      payload = {
        active: false,
        message: access.message || "No active subscription",
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
