/**
 * Quick test to verify the parameter fix
 * Run this in browser console to test the fix
 */

import { sendWelcomeEmail } from "./email-service";

/**
 * Test the fixed email parameters
 */
export const testFixedEmailParameters = async () => {
  console.log("🧪 TESTING FIXED EMAIL PARAMETERS");
  console.log("=================================");

  // Your working parameters
  const workingParams = {
    title: "Welcome",
    email: "safiurrehman2000@yahoo.com",
    name: "Flexijobber",
  };

  console.log("✅ Your working parameters:", workingParams);

  // Test our updated service
  console.log("\n📧 Testing updated email service...");
  const result = await sendWelcomeEmail(
    "safiurrehman2000@yahoo.com",
    "Test User",
    "Candidate"
  );

  console.log("📊 Result:", result);

  if (result) {
    console.log("✅ SUCCESS! Check your email and EmailJS dashboard");
  } else {
    console.log("❌ Still failing - check console for details");
  }

  return result;
};

/**
 * Console command to run the test
 */
export const runQuickTest = () => {
  console.log("Run this command in browser console:");
  console.log("await testFixedEmailParameters()");
};

export default testFixedEmailParameters;
