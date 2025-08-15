const functions = require("firebase-functions");
const admin = require("firebase-admin");
const emailjs = require("@emailjs/browser");

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// EmailJS configuration
const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

// Initialize EmailJS
emailjs.init(EMAIL_CONFIG.publicKey);

/**
 * Send job alert email to a candidate
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @returns {Promise<boolean>} - Success status
 */
const sendJobAlertEmail = async (userEmail, userName, jobs = []) => {
  try {
    if (jobs.length === 0) {
      console.log(`No jobs to send for ${userEmail}`);
      return true;
    }

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
      `Sending job alert email to: ${userEmail} with ${jobs.length} jobs`
    );

    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
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
    const result = await sendJobAlertsLogic();
    res.json(result);
  } catch (error) {
    console.error("HTTP function error:", error);
    res.status(500).json({ error: error.message });
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
          matchingJobs
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
