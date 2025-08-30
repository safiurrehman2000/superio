const functions = require("firebase-functions");
const admin = require("firebase-admin");
const SibApiV3Sdk = require("@getbrevo/brevo");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Brevo configuration
const BREVO_CONFIG = {
  apiKey: functions.config().brevo?.api_key || process.env.BREVO_API_KEY,
  senderEmail:
    functions.config().brevo?.sender_email ||
    process.env.BREVO_SENDER_EMAIL ||
    "noreply@de-flexi-jobber.be",
  senderName:
    functions.config().brevo?.sender_name ||
    process.env.BREVO_SENDER_NAME ||
    "Flexijobber",
  replyToEmail:
    functions.config().brevo?.reply_to_email ||
    process.env.BREVO_REPLY_TO_EMAIL ||
    "info@horecabenelux.com",
};

// Initialize Brevo API
const brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Debug Brevo configuration
console.log(
  "🔑 Brevo API Key check:",
  BREVO_CONFIG.apiKey
    ? `${BREVO_CONFIG.apiKey.substring(0, 10)}...`
    : "NOT FOUND"
);
console.log("📧 Brevo Sender Email:", BREVO_CONFIG.senderEmail);
console.log("👤 Brevo Sender Name:", BREVO_CONFIG.senderName);

if (!BREVO_CONFIG.apiKey) {
  console.error("❌ BREVO_API_KEY is not configured!");
} else if (!BREVO_CONFIG.apiKey.startsWith("xkeysib-")) {
  console.error("❌ BREVO_API_KEY does not start with 'xkeysib-'");
} else {
  console.log("✅ Brevo API Key format looks correct");
  brevoApiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    BREVO_CONFIG.apiKey
  );
}

/**
 * Create HTML content for job alert email
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @param {string} alertKeywords - Alert keywords
 * @returns {string} - HTML content
 */
const createJobAlertEmailContent = (userName, jobs, alertKeywords = "") => {
  const jobCards = jobs
    .map((job) => {
      const jobDate = job.createdAt
        ? new Date(job.createdAt).toLocaleDateString()
        : "Recently";

      return `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
          <h3 style="color: #007bff; margin-bottom: 10px;">${
            job.title || "Job Opportunity"
          }</h3>
          <p style="color: #666; margin-bottom: 5px;"><strong>Company:</strong> ${
            job.company || job.employerName || "Company"
          }</p>
          <p style="color: #888; margin-bottom: 15px;"><strong>📍 Location:</strong> ${
            job.location || "Location not specified"
          }</p>
          <p style="margin-bottom: 10px;"><strong>Posted:</strong> ${jobDate}</p>
          <p style="margin-bottom: 20px;"><strong>Description:</strong> ${(
            job.description || "No description available"
          ).substring(0, 200)}${
        (job.description || "").length > 200 ? "..." : ""
      }</p>
          <a href="https://de-flexi-jobber.be/job-list/${job.id}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            View Job Details
          </a>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Job Opportunities - Flexijobber</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 20px; border: 1px solid #ddd; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
        .job-count { background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Job Opportunities!</h1>
          <p>We found ${jobs.length} job${
    jobs.length > 1 ? "s" : ""
  } that match your preferences</p>
        </div>
        
        <div class="content">
          <div class="job-count">
            <h3>Hello ${userName || "there"}!</h3>
            <p>Based on your job alert preferences for: <strong>${
              alertKeywords || "your selected criteria"
            }</strong></p>
          </div>
          
          ${jobCards}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://de-flexi-jobber.be/candidates-dashboard/job-alerts" 
               style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
              Manage Your Job Alerts
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you created a job alert for: <strong>${
            alertKeywords || "your preferences"
          }</strong></p>
          <p>To unsubscribe or manage your alerts, <a href="https://de-flexi-jobber.be/candidates-dashboard/job-alerts">click here</a></p>
          <p>Best regards,<br>The Flexijobber Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send job alert email to a candidate using Brevo
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @param {string} alertKeywords - Alert keywords
 * @returns {Promise<boolean>} - Success status
 */
const sendJobAlertEmail = async (
  userEmail,
  userName,
  jobs = [],
  alertKeywords = ""
) => {
  try {
    if (jobs.length === 0) {
      console.log(`No jobs to send for ${userEmail}`);
      return true;
    }

    console.log(
      `Sending job alert email to: ${userEmail} with ${jobs.length} jobs`
    );

    // Create email content
    const htmlContent = createJobAlertEmailContent(
      userName,
      jobs,
      alertKeywords
    );

    // Create email data
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: userEmail, name: userName }];
    sendSmtpEmail.subject = `🎯 ${jobs.length} New Job Opportunity${
      jobs.length > 1 ? "ies" : ""
    } - Flexijobber`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: BREVO_CONFIG.senderName,
      email: BREVO_CONFIG.senderEmail,
    };
    sendSmtpEmail.replyTo = {
      name: BREVO_CONFIG.senderName,
      email: BREVO_CONFIG.replyToEmail,
    };

    // Send the email
    const response = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Job alert email sent successfully to: ${userEmail}`);
    console.log(`📧 Message ID: ${response.messageId}`);

    return true;
  } catch (error) {
    console.error(`💥 Error sending job alert email to ${userEmail}:`, error);
    return false;
  }
};

/**
 * Get recent jobs that match candidate preferences
 * @param {Object} userData - User data from Firestore
 * @param {Object} alertData - Job alert preferences
 * @returns {Promise<Array>} - Array of matching jobs
 */
const getMatchingJobs = async (userData, alertData) => {
  try {
    const jobsRef = db.collection("jobs");
    let query = jobsRef.where("status", "==", "active");

    // Filter by date (last 7 days by default)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.where("createdAt", ">=", sevenDaysAgo.getTime());

    // Apply category filter if specified
    if (alertData.categories && alertData.categories.length > 0) {
      // Note: Firestore doesn't support array-contains-any with multiple fields
      // For now, we'll get all jobs and filter in memory
    }

    // Apply location filter if specified
    if (alertData.locations && alertData.locations.length > 0) {
      // Note: Firestore doesn't support array-contains-any with multiple fields
      // For now, we'll get all jobs and filter in memory
    }

    const snapshot = await query.get();
    let jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by categories in memory
    if (alertData.categories && alertData.categories.length > 0) {
      jobs = jobs.filter(
        (job) =>
          job.tags && job.tags.some((tag) => alertData.categories.includes(tag))
      );
    }

    // Filter by locations in memory
    if (alertData.locations && alertData.locations.length > 0) {
      jobs = jobs.filter(
        (job) => job.location && alertData.locations.includes(job.location)
      );
    }

    // Filter by keywords in memory
    if (alertData.keywords && alertData.keywords.trim()) {
      const keywords = alertData.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim());
      jobs = jobs.filter((job) => {
        const jobText = [
          job.title || "",
          job.description || "",
          ...(job.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        return keywords.some((keyword) => keyword && jobText.includes(keyword));
      });
    }

    // Sort by creation date (newest first) and limit to 20 jobs
    jobs.sort((a, b) => b.createdAt - a.createdAt);
    return jobs.slice(0, 20);
  } catch (error) {
    console.error("Error getting matching jobs:", error);
    return [];
  }
};

/**
 * Main function to send job alerts to all candidates
 */
exports.sendJobAlerts = functions.scheduler.onSchedule(
  "every 24 hours",
  async () => {
    return await sendJobAlertsLogic();
  }
);

/**
 * HTTP callable version for testing
 */
exports.sendJobAlertsHttp = functions.https.onRequest(async (req, res) => {
  try {
    console.log("🚀 HTTP function called - starting job alerts process...");

    // Check if Brevo is properly configured
    if (!BREVO_CONFIG.apiKey || !BREVO_CONFIG.apiKey.startsWith("xkeysib-")) {
      console.error("❌ Brevo API key not properly configured");
      return res.status(500).json({
        error: "Brevo API key not properly configured",
        details: "Please check the Firebase function configuration",
      });
    }

    const result = await sendJobAlertsLogic();
    console.log("✅ HTTP function completed successfully:", result);
    res.json(result);
  } catch (error) {
    console.error("💥 HTTP function error:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

/**
 * Core logic for sending job alerts
 */
const sendJobAlertsLogic = async () => {
  console.log("🚀 Starting job alerts process...");

  try {
    // Get all candidates
    const usersRef = db.collection("users");
    const candidatesSnapshot = await usersRef
      .where("userType", "==", "Candidate")
      .get();

    if (candidatesSnapshot.empty) {
      console.log("No candidates found");
      return null;
    }

    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;

    // Process each candidate
    for (const userDoc of candidatesSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        // Check if user has job alerts enabled
        const alertsSnapshot = await db
          .collection(`users/${userId}/jobAlerts`)
          .where("status", "==", "active")
          .get();

        if (alertsSnapshot.empty) {
          console.log(`No active job alerts for user ${userId}`);
          continue;
        }

        // Get the first active alert (assuming one alert per user for now)
        const alertData = alertsSnapshot.docs[0].data();

        // Get matching jobs
        const matchingJobs = await getMatchingJobs(userData, alertData);

        if (matchingJobs.length === 0) {
          console.log(`No matching jobs found for user ${userId}`);
          continue;
        }

        // Send job alert email
        const emailSent = await sendJobAlertEmail(
          userData.email,
          userData.name || userData.email.split("@")[0],
          matchingJobs,
          alertData.keywords || ""
        );

        if (emailSent) {
          totalEmailsSent++;
          console.log(`✅ Job alert sent to ${userData.email}`);
        } else {
          totalEmailsFailed++;
          console.log(`❌ Failed to send job alert to ${userData.email}`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        totalEmailsFailed++;
      }
    }

    console.log(`🎉 Job alerts process completed!`);
    console.log(`📧 Total emails sent: ${totalEmailsSent}`);
    console.log(`❌ Total emails failed: ${totalEmailsFailed}`);

    return {
      success: true,
      emailsSent: totalEmailsSent,
      emailsFailed: totalEmailsFailed,
    };
  } catch (error) {
    console.error("💥 Error in sendJobAlerts function:", error);
    throw error;
  }
};
