import { NextResponse } from "next/server";
import { sendWelcomeEmailBrevo } from "@/utils/brevo-email-service";

export async function POST(request) {
  try {
    const { userEmail, userName = "", userType = "User" } =
      (await request.json()) || {};

    if (!userEmail || typeof userEmail !== "string") {
      return NextResponse.json(
        { success: false, error: "userEmail is required" },
        { status: 400 }
      );
    }

    const ok = await sendWelcomeEmailBrevo(userEmail, userName, userType);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to send welcome email" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
