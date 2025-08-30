import { NextResponse } from "next/server";
import { sendBrevoEmail } from "@/utils/brevo-email-service";

export async function POST(request) {
  try {
    const { testEmail, testName = "Test User" } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "Test email is required" },
        { status: 400 }
      );
    }

    console.log("🧪 Testing Brevo email integration...");
    console.log("Test email:", testEmail);

    // Debug environment variables
    console.log("🔍 Environment check:");
    console.log("- BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
    console.log(
      "- BREVO_API_KEY starts with xkeysib-:",
      process.env.BREVO_API_KEY?.startsWith("xkeysib-")
    );
    console.log("- BREVO_SENDER_EMAIL:", process.env.BREVO_SENDER_EMAIL);
    console.log("- BREVO_SENDER_NAME:", process.env.BREVO_SENDER_NAME);

    // Create a simple test email
    const testEmailData = {
      to: [{ email: testEmail, name: testName }],
      subject: "🧪 Brevo Integration Test - Flexijobber",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Brevo Integration Test</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 20px; border: 1px solid #ddd; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Brevo Integration Test</h1>
              <p>This is a test email to verify Brevo integration</p>
            </div>
            
            <div class="content">
              <h3>Hello ${testName}!</h3>
              <p>This email confirms that your Brevo integration is working correctly.</p>
              
              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>✅ Integration Status: SUCCESS</h4>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Email Service:</strong> Brevo (formerly Sendinblue)</p>
                <p><strong>Environment:</strong> ${
                  process.env.NODE_ENV || "development"
                }</p>
              </div>
              
              <p>Your job alert system is now ready to send real emails!</p>
            </div>
            
            <div class="footer">
              <p>This is a test email. You can safely ignore it.</p>
              <p>Best regards,<br>The Flexijobber Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      senderName: "Flexijobber Test",
      senderEmail: "noreply@de-flexi-jobber.be",
      replyTo: "info@horecabenelux.com",
    };

    // Send the test email
    const result = await sendBrevoEmail(testEmailData);

    console.log("✅ Brevo test email sent successfully!");
    console.log("Message ID:", result.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      testEmail: testEmail,
    });
  } catch (error) {
    console.error("💥 Error in Brevo test:", error);

    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
