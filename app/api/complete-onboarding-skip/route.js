import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";

/**
 * POST /api/complete-onboarding-skip
 * Marks employer onboarding as complete (isFirstTime: false, hasPostedJob: true)
 * so the user can leave the onboarding flow. Uses admin SDK so it works
 * regardless of client Firestore rules.
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userId" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update({
      isFirstTime: false,
      hasPostedJob: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("complete-onboarding-skip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding skip" },
      { status: 500 }
    );
  }
}
