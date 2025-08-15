import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🧪 Testing EmailJS REST API...");

    // Server-side EmailJS configuration
    const EMAIL_CONFIG = {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      templateId: process.env.NEXT_PUBLIC_EMAILJS_JOB_ALERT_TEMPLATE_ID,
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    };

    console.log("📧 EmailJS Config:", {
      serviceId: EMAIL_CONFIG.serviceId,
      templateId: EMAIL_CONFIG.templateId,
      publicKey: EMAIL_CONFIG.publicKey ? "***" : "NOT SET",
    });

    const templateParams = {
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

    console.log("📧 Template Params:", templateParams);

    // Use EmailJS REST API
    const response = await fetch(
      `https://api.emailjs.com/api/v1.0/email/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.serviceId,
          template_id: EMAIL_CONFIG.templateId,
          user_id: EMAIL_CONFIG.privateKey || EMAIL_CONFIG.publicKey,
          template_params: templateParams,
        }),
      }
    );

    let result;
    const responseText = await response.text();

    try {
      result = JSON.parse(responseText);
      console.log("✅ EmailJS REST API response:", result);
    } catch (error) {
      console.log("❌ EmailJS returned non-JSON response:", responseText);
      result = { error: "Non-JSON response", text: responseText };
    }

    return NextResponse.json({
      success: response.ok && result.status === "OK",
      result: result,
      config: {
        serviceId: EMAIL_CONFIG.serviceId,
        templateId: EMAIL_CONFIG.templateId,
        publicKey: EMAIL_CONFIG.publicKey ? "***" : "NOT SET",
      },
    });
  } catch (error) {
    console.error("💥 EmailJS REST API test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
