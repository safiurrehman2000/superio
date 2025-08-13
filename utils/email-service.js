import emailjs from "@emailjs/browser";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "./email-config";
import { errorToast, successToast } from "./toast";

/**
 * Initialize EmailJS with the public key
 */
const initEmailJS = () => {
  emailjs.init(EMAIL_CONFIG.publicKey);
};

/**
 * Send welcome email to newly registered user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name (optional)
 * @param {string} userType - User type (Candidate or Employer)
 * @returns {Promise<boolean>} - Success status
 */
export const sendWelcomeEmail = async (
  userEmail,
  userName = "",
  userType = "User"
) => {
  try {
    initEmailJS();

    // Updated to match your working EmailJS template parameters
    const templateParams = {
      title: "Welcome to Flexijobber!",
      email: userEmail, // Changed from to_email to email
      name: userName || userEmail.split("@")[0], // Changed from to_name to name
      // Keeping additional parameters for enhanced templates
      user_type: userType,
      from_name: "Flexijobber Team",
      message: `Welcome to Flexijobber! We're excited to have you join our community as a ${userType.toLowerCase()}.`,
      reply_to: "support@flexijobber.com",
    };

    // Debug logging to check sender/recipient
    console.log("📧 EMAIL DEBUG - Sending welcome email:");
    console.log("====================================");
    console.log("📧 TO (Recipient):", templateParams.email); // Updated from to_email
    console.log("👤 TO NAME:", templateParams.name); // Updated from to_name
    console.log("📝 TITLE:", templateParams.title); // Added title
    console.log("🏢 FROM NAME:", templateParams.from_name);
    console.log("↩️  REPLY TO:", templateParams.reply_to);
    console.log("🔑 Service ID:", EMAIL_CONFIG.serviceId);
    console.log("📝 Template ID:", EMAIL_TEMPLATES.WELCOME);
    console.log("====================================");

    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.WELCOME,
      templateParams
    );

    // EmailJS always returns an object, even on success
    console.log("📬 EmailJS Full Response:", result);
    console.log("📊 Response Status:", result.status);
    console.log("📝 Response Text:", result.text);

    if (result.status === 200) {
      console.log(
        "✅ Welcome email sent successfully to:",
        templateParams.email
      );
      console.log("💰 You were charged for this email");
      console.log("📧 Check if email was delivered to recipient");
      return true;
    } else {
      console.error("❌ EmailJS returned non-200 status:", result.status);
      console.error("📄 Response text:", result.text);
      console.error("💰 You may still be charged for this request");
      errorToast(`Email sending failed: ${result.text || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    console.error("💥 Error sending welcome email:", error);
    console.error("🔍 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Different error messages based on error type
    if (error.message.includes("fetch") || error.message.includes("network")) {
      errorToast("Network error: Please check your internet connection.");
    } else if (
      error.message.includes("service") ||
      error.message.includes("template")
    ) {
      errorToast("EmailJS configuration error: Please check service settings.");
    } else {
      errorToast(`Email error: ${error.message}`);
    }
    return false;
  }
};

/**
 * Send job alert email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @returns {Promise<boolean>} - Success status
 */
export const sendJobAlertEmail = async (
  userEmail,
  userName = "",
  jobs = []
) => {
  try {
    initEmailJS();

    const templateParams = {
      title: "New Job Opportunities for You!",
      email: userEmail,
      name: userName || userEmail.split("@")[0],
      user_type: "Candidate",
      from_name: "Flexijobber Job Alerts",
      message: `We found ${jobs.length} new job opportunities that match your profile!`,
      reply_to: "jobs@flexijobber.com",
      jobs_count: jobs.length,
      jobs_list: jobs
        .slice(0, 10) // Limit to 10 jobs in email
        .map((job) => `• ${job.title} at ${job.company || "Company"}`)
        .join("\n"),
    };

    console.log(
      `📧 Sending job alert email to: ${userEmail} with ${jobs.length} jobs`
    );

    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.JOB_ALERT,
      templateParams
    );

    if (result.status === 200) {
      console.log(`✅ Job alert email sent successfully to: ${userEmail}`);
      return true;
    } else {
      console.error(
        `❌ EmailJS returned non-200 status for ${userEmail}:`,
        result.status
      );
      return false;
    }
  } catch (error) {
    console.error(`💥 Error sending job alert email to ${userEmail}:`, error);
    return false;
  }
};

/**
 * Send custom email
 * @param {string} templateId - EmailJS template ID
 * @param {Object} templateParams - Template parameters
 * @returns {Promise<boolean>} - Success status
 */
export const sendCustomEmail = async (templateId, templateParams) => {
  try {
    initEmailJS();

    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      templateId,
      templateParams
    );

    return result.status === 200;
  } catch (error) {
    console.error("Error sending custom email:", error);
    return false;
  }
};
