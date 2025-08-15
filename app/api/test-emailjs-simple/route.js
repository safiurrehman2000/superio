import { NextResponse } from "next/server";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "@/utils/email-config";

export async function GET() {
  try {
    console.log("🧪 Simple EmailJS configuration test...");

    const config = {
      serviceId: EMAIL_CONFIG.serviceId,
      templateId: EMAIL_TEMPLATES.JOB_ALERT,
      publicKey: EMAIL_CONFIG.publicKey,
      welcomeTemplateId: EMAIL_TEMPLATES.WELCOME,
    };

    console.log("📧 EmailJS Config:", config);

    // Check if all required values are present
    const missingValues = [];
    if (!config.serviceId) missingValues.push("serviceId");
    if (!config.templateId) missingValues.push("templateId");
    if (!config.publicKey) missingValues.push("publicKey");

    const result = {
      success: missingValues.length === 0,
      config: {
        ...config,
        publicKey: config.publicKey ? "***" : "NOT SET",
      },
      missingValues,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasServiceId: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        hasTemplateId: !!process.env.NEXT_PUBLIC_EMAILJS_JOB_ALERT_TEMPLATE_ID,
        hasPublicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      },
    };

    console.log("✅ Test result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
