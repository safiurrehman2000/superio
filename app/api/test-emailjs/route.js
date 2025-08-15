import { NextResponse } from "next/server";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "@/utils/email-config";
import emailjs from "@emailjs/browser";

// Initialize EmailJS with the public key
const initEmailJS = () => {
  emailjs.init(EMAIL_CONFIG.publicKey);
};

export async function POST() {
  try {
    // Mock browser environment for EmailJS
    if (typeof window === "undefined") {
      global.window = {};
      global.location = { href: "http://localhost:3000" };
      global.document = { createElement: () => ({}) };
    }

    console.log("🧪 Testing EmailJS configuration...");

    // Test with the job alert template
    const testParams = {
      job_title: "Test React Developer",
      company_name: "Test Company",
      location: "Test Location",
      posted_date: "Today",
      job_description: "This is a test job description for React development.",
      job_url: "http://localhost:3000/test-job",
      alert_keywords: "React, JavaScript",
      manage_alerts_url: "http://localhost:3000/job-alerts",
      to_email: "test@example.com",
      from_name: "Flexijobber Test",
      reply_to: "test@flexijobber.com",
    };

    console.log("📧 EmailJS Config:", {
      serviceId: EMAIL_CONFIG.serviceId,
      templateId: EMAIL_TEMPLATES.JOB_ALERT,
      publicKey: EMAIL_CONFIG.publicKey,
    });

    console.log("📧 Template Params:", testParams);

    initEmailJS();

    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.JOB_ALERT,
      testParams
    );

    console.log("✅ EmailJS test result:", result);

    return NextResponse.json({
      success: true,
      result: result,
      config: {
        serviceId: EMAIL_CONFIG.serviceId,
        templateId: EMAIL_TEMPLATES.JOB_ALERT,
        publicKey: EMAIL_CONFIG.publicKey ? "***" : "NOT SET",
      },
    });
  } catch (error) {
    console.error("💥 EmailJS test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        config: {
          serviceId: EMAIL_CONFIG.serviceId,
          templateId: EMAIL_TEMPLATES.JOB_ALERT,
          publicKey: EMAIL_CONFIG.publicKey ? "***" : "NOT SET",
        },
      },
      { status: 500 }
    );
  }
}
