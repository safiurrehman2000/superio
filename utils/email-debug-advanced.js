/**
 * Advanced EmailJS debugging utilities
 * Specific debugging for when EmailJS charges but emails don't send
 */

import emailjs from "@emailjs/browser";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "./email-config";

/**
 * Check EmailJS response in detail
 * @param {string} userEmail - Test email
 * @param {string} userName - Test name
 */
export const debugEmailJSResponse = async (
  userEmail,
  userName = "Test User"
) => {
  console.log("🔍 ADVANCED EMAILJS DEBUG - Starting detailed analysis");
  console.log("=====================================================");

  try {
    // Initialize EmailJS
    emailjs.init(EMAIL_CONFIG.publicKey);
    console.log("✅ EmailJS initialized successfully");

    const templateParams = {
      title: "Welcome to Flexijobber!",
      email: userEmail, // Changed to match your working template
      name: userName, // Changed to match your working template
      user_type: "Candidate",
      from_name: "Flexijobber Team",
      message:
        "Welcome to Flexijobber! We're excited to have you join our community as a candidate.",
      reply_to: "support@flexijobber.com",
    };

    console.log("📧 Template Parameters:");
    console.log(JSON.stringify(templateParams, null, 2));

    console.log("🔧 EmailJS Configuration:");
    console.log("Service ID:", EMAIL_CONFIG.serviceId);
    console.log("Template ID:", EMAIL_TEMPLATES.WELCOME);
    console.log(
      "Public Key:",
      EMAIL_CONFIG.publicKey ? "✅ Present" : "❌ Missing"
    );

    console.log("📤 Sending email request to EmailJS...");

    // Send with detailed response capture
    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.WELCOME,
      templateParams
    );

    console.log("📬 DETAILED EMAILJS RESPONSE:");
    console.log("============================");
    console.log("Status Code:", result.status);
    console.log("Status Text:", result.text);
    console.log("Full Response Object:", result);
    console.log("Response Type:", typeof result);
    console.log("Response Keys:", Object.keys(result));

    // Check specific status codes
    if (result.status === 200) {
      console.log("✅ EmailJS reports SUCCESS (Status 200)");
      console.log("💰 This means you WILL be charged");
      console.log("📧 Email should be sent to:", userEmail);
      return { success: true, result, charged: true };
    } else if (result.status >= 400) {
      console.log(`❌ EmailJS reports ERROR (Status ${result.status})`);
      console.log("💰 You may still be charged depending on the error");
      return {
        success: false,
        result,
        charged: true,
        error: `HTTP ${result.status}`,
      };
    } else {
      console.log(`⚠️  Unexpected status: ${result.status}`);
      return {
        success: false,
        result,
        charged: true,
        error: `Unexpected status ${result.status}`,
      };
    }
  } catch (error) {
    console.log("💥 EMAILJS ERROR DETAILS:");
    console.log("=========================");
    console.log("Error Type:", error.constructor.name);
    console.log("Error Message:", error.message);
    console.log("Error Stack:", error.stack);
    console.log("Full Error Object:", error);

    // Check if it's a network error vs EmailJS error
    if (error.message.includes("fetch") || error.message.includes("network")) {
      console.log("🌐 This appears to be a NETWORK ERROR");
      console.log("💰 You probably WERE NOT charged");
    } else {
      console.log("⚠️  This appears to be an EmailJS SERVICE ERROR");
      console.log("💰 You probably WERE charged");
    }

    return { success: false, error: error.message, charged: false };
  }
};

/**
 * Test EmailJS service configuration
 */
export const testEmailJSService = async () => {
  console.log("🧪 TESTING EMAILJS SERVICE CONFIGURATION");
  console.log("========================================");

  try {
    // Test if EmailJS is accessible
    console.log("🔗 Testing EmailJS API accessibility...");

    // Initialize with config
    emailjs.init(EMAIL_CONFIG.publicKey);

    // Try to send a minimal test
    const testResult = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.WELCOME,
      {
        title: "Test Email",
        email: "test@example.com", // Updated to match template
        name: "Test", // Updated to match template
        from_name: "Test",
        message: "Test message",
        reply_to: "test@example.com",
      }
    );

    console.log("✅ EmailJS service is accessible");
    console.log("📊 Test result:", testResult);

    return { accessible: true, result: testResult };
  } catch (error) {
    console.log("❌ EmailJS service test failed:");
    console.log("Error:", error.message);

    return { accessible: false, error: error.message };
  }
};

/**
 * Check environment variables in detail
 */
export const debugEnvironmentVariables = () => {
  console.log("🌍 ENVIRONMENT VARIABLES DETAILED CHECK");
  console.log("======================================");

  const vars = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    welcomeTemplateId: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID,
  };

  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${key}: MISSING`);
    }
  });

  // Check what's actually being used
  console.log("\n🔧 ACTUAL VALUES BEING USED:");
  console.log("Service ID:", EMAIL_CONFIG.serviceId);
  console.log("Template ID:", EMAIL_TEMPLATES.WELCOME);
  console.log(
    "Public Key:",
    EMAIL_CONFIG.publicKey
      ? `${EMAIL_CONFIG.publicKey.substring(0, 10)}...`
      : "MISSING"
  );

  return vars;
};

/**
 * Comprehensive debugging for charging but not sending issue
 */
export const debugChargingIssue = async (testEmail = "test@example.com") => {
  console.log("🚨 DEBUGGING: CHARGED BUT NO EMAIL ISSUE");
  console.log("=======================================");

  // Step 1: Check environment
  console.log("STEP 1: Environment Variables");
  debugEnvironmentVariables();

  // Step 2: Test service
  console.log("\nSTEP 2: Service Accessibility");
  const serviceTest = await testEmailJSService();

  // Step 3: Detailed response analysis
  console.log("\nSTEP 3: Detailed Response Analysis");
  const responseTest = await debugEmailJSResponse(testEmail);

  // Step 4: Analysis and recommendations
  console.log("\n🎯 ANALYSIS AND RECOMMENDATIONS:");
  console.log("================================");

  if (responseTest.success && responseTest.charged) {
    console.log("✅ EmailJS API call succeeded");
    console.log("💰 You are being charged correctly");
    console.log("❌ Email not delivered = Configuration issue");
    console.log("\n🔧 LIKELY ISSUES:");
    console.log("1. EmailJS template configuration incorrect");
    console.log("2. Email service (Gmail/Outlook) restrictions");
    console.log("3. Recipient email in spam/blocked");
    console.log("4. Template variable mapping wrong");
  } else if (!responseTest.success && responseTest.charged) {
    console.log("❌ EmailJS API call failed but you're charged");
    console.log("💰 This indicates a service-side issue");
    console.log("\n🔧 LIKELY ISSUES:");
    console.log("1. EmailJS service configuration problem");
    console.log("2. Template ID mismatch");
    console.log("3. Service ID incorrect");
  } else {
    console.log("❌ Network or connection issue");
    console.log("💰 You should NOT be charged for this");
  }

  return {
    environmentOk: Object.values(debugEnvironmentVariables()).every((v) => v),
    serviceAccessible: serviceTest.accessible,
    apiCallSuccess: responseTest.success,
    charged: responseTest.charged,
  };
};

export default {
  debugEmailJSResponse,
  testEmailJSService,
  debugEnvironmentVariables,
  debugChargingIssue,
};
