/**
 * Email debugging utilities
 * Use these functions to debug EmailJS sender/recipient issues
 */

import emailjs from "@emailjs/browser";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "./email-config";

/**
 * Debug function to check what parameters are being sent to EmailJS
 * @param {string} userEmail - The intended recipient email
 * @param {string} userName - The recipient name
 * @param {string} userType - User type (Candidate/Employer)
 */
export const debugEmailParameters = (userEmail, userName, userType) => {
  const templateParams = {
    to_email: userEmail,
    to_name: userName || userEmail.split("@")[0],
    user_type: userType,
    from_name: "Flexijobber Team",
    message: `Welcome to Flexijobber! We're excited to have you join our community as a ${userType.toLowerCase()}.`,
    reply_to: "support@flexijobber.com",
  };

  console.log("🔍 EMAIL DEBUG - Template Parameters:");
  console.log("====================================");
  console.log("📧 Recipient (to_email):", templateParams.to_email);
  console.log("👤 Recipient Name (to_name):", templateParams.to_name);
  console.log("🏢 From Name (from_name):", templateParams.from_name);
  console.log("↩️  Reply To (reply_to):", templateParams.reply_to);
  console.log("👥 User Type (user_type):", templateParams.user_type);
  console.log("💬 Message:", templateParams.message);
  console.log("====================================");

  return templateParams;
};

/**
 * Debug EmailJS configuration
 */
export const debugEmailJSConfig = () => {
  console.log("🔍 EMAILJS CONFIG DEBUG:");
  console.log("========================");
  console.log("🔑 Service ID:", EMAIL_CONFIG.serviceId);
  console.log("📝 Template ID:", EMAIL_TEMPLATES.WELCOME);
  console.log(
    "🔐 Public Key:",
    EMAIL_CONFIG.publicKey ? "✅ Set" : "❌ Missing"
  );
  console.log("========================");
};

/**
 * Send a test email with detailed logging
 * @param {string} testEmail - Email to send test to
 * @param {string} testName - Name for the test
 */
export const sendTestEmailWithDebug = async (
  testEmail,
  testName = "Test User"
) => {
  try {
    console.log("🧪 STARTING EMAIL TEST");
    console.log("======================");

    // Debug configuration
    debugEmailJSConfig();

    // Debug parameters
    const templateParams = debugEmailParameters(
      testEmail,
      testName,
      "Candidate"
    );

    // Initialize EmailJS
    emailjs.init(EMAIL_CONFIG.publicKey);
    console.log("✅ EmailJS initialized");

    // Send email with detailed logging
    console.log("📤 Sending email...");
    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.WELCOME,
      templateParams
    );

    console.log("📬 EMAIL SEND RESULT:");
    console.log("====================");
    console.log("Status:", result.status);
    console.log("Text:", result.text);
    console.log("Full Result:", result);
    console.log("====================");

    if (result.status === 200) {
      console.log("✅ Email sent successfully!");
      return { success: true, result };
    } else {
      console.log("❌ Email failed to send");
      return { success: false, result };
    }
  } catch (error) {
    console.error("💥 EMAIL TEST ERROR:");
    console.error("===================");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("===================");
    return { success: false, error };
  }
};

/**
 * Check current environment variables
 */
export const debugEmailEnvironment = () => {
  console.log("🌍 ENVIRONMENT VARIABLES DEBUG:");
  console.log("===============================");
  console.log(
    "NEXT_PUBLIC_EMAILJS_SERVICE_ID:",
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  );
  console.log(
    "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:",
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  );
  console.log(
    "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:",
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID:",
    process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
  );
  console.log("===============================");
};

/**
 * Comprehensive email debugging function
 * Run this to debug all email issues
 */
export const runFullEmailDebug = async (testEmail = "test@example.com") => {
  console.log("🚀 FULL EMAIL DEBUG SESSION");
  console.log("===========================");

  // Check environment
  debugEmailEnvironment();

  // Check configuration
  debugEmailJSConfig();

  // Test with sample parameters
  const testParams = debugEmailParameters(testEmail, "Debug User", "Candidate");

  // Send test email
  console.log("📧 Sending test email to:", testEmail);
  const result = await sendTestEmailWithDebug(testEmail, "Debug User");

  console.log("🏁 DEBUG SESSION COMPLETE");
  console.log("=========================");

  return result;
};

export default {
  debugEmailParameters,
  debugEmailJSConfig,
  sendTestEmailWithDebug,
  debugEmailEnvironment,
  runFullEmailDebug,
};
