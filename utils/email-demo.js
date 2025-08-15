/**
 * Demo file showing how to use the welcome email functionality
 * This file demonstrates various ways to send emails using the email service
 */

import { sendWelcomeEmail, sendCustomEmail } from "./email-service";

/**
 * Demo: Send welcome email to a new candidate
 */
export const demoCandidateWelcome = async () => {
  try {
    const success = await sendWelcomeEmail(
      "newcandidate@example.com",
      "John Doe",
      "Candidate"
    );

    if (success) {
      console.log("✅ Candidate welcome email sent successfully!");
    } else {
      console.log("❌ Failed to send candidate welcome email");
    }

    return success;
  } catch (error) {
    console.error("Error in candidate welcome demo:", error);
    return false;
  }
};

/**
 * Demo: Send welcome email to a new employer
 */
export const demoEmployerWelcome = async () => {
  try {
    const success = await sendWelcomeEmail(
      "newemployer@company.com",
      "Jane Smith",
      "Employer"
    );

    if (success) {
      console.log("✅ Employer welcome email sent successfully!");
    } else {
      console.log("❌ Failed to send employer welcome email");
    }

    return success;
  } catch (error) {
    console.error("Error in employer welcome demo:", error);
    return false;
  }
};

/**
 * Demo: Send custom email using different template
 */
export const demoCustomEmail = async () => {
  try {
    const success = await sendCustomEmail("template_ze5clom", {
      to_email: "custom@example.com",
      to_name: "Custom User",
      from_name: "Flexijobber Support",
      message: "This is a custom email message for testing purposes.",
      reply_to: "support@flexijobber.com",
    });

    if (success) {
      console.log("✅ Custom email sent successfully!");
    } else {
      console.log("❌ Failed to send custom email");
    }

    return success;
  } catch (error) {
    console.error("Error in custom email demo:", error);
    return false;
  }
};

/**
 * Run all email demos
 */
export const runEmailDemos = async () => {
  console.log("🚀 Starting email service demos...\n");

  console.log("1. Testing Candidate Welcome Email:");
  await demoCandidateWelcome();

  console.log("\n2. Testing Employer Welcome Email:");
  await demoEmployerWelcome();

  console.log("\n3. Testing Custom Email:");
  await demoCustomEmail();

  console.log("\n✨ Email demos completed!");
};

// Export individual functions for testing
export default {
  demoCandidateWelcome,
  demoEmployerWelcome,
  demoCustomEmail,
  runEmailDemos,
};
