import { NextResponse } from "next/server";
import * as SibApiV3Sdk from "@getbrevo/brevo";

export async function POST(request) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "Test email is required" },
        { status: 400 }
      );
    }

    console.log("🧪 Testing simple Brevo email to:", testEmail);

    // Create a simple API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Create a very simple email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: testEmail }];
    sendSmtpEmail.subject = "Simple Brevo Test";
    sendSmtpEmail.htmlContent =
      "<h1>Test Email</h1><p>This is a simple test email from Brevo.</p>";
    sendSmtpEmail.sender = {
      name: "Test Sender",
      email: "info@horecabenelux.com",
    };

    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Simple test email sent:", response);

    return NextResponse.json({
      success: true,
      message: "Simple test email sent",
      messageId: response.messageId,
    });
  } catch (error) {
    console.error("💥 Error in simple Brevo test:", error);

    return NextResponse.json(
      {
        error: "Failed to send simple test email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
