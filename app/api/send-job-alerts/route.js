import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";
import emailjs from "@emailjs/browser";

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
 */
const getMatchingJobs = async (alertData) => {
  try {
    const jobsRef = adminDb.collection("jobs");
    let query = jobsRef.where("status", "==", "active");

    // Filter by date (last 7 days by default)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.where("createdAt", ">=", sevenDaysAgo.getTime());

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

    // Sort by creation date (newest first) and limit to 20 jobs
    jobs.sort((a, b) => b.createdAt - a.createdAt);
    return jobs.slice(0, 20);
  } catch (error) {
    console.error("Error getting matching jobs:", error);
    return [];
  }
};

export async function POST(request) {
  try {
    const { userId, testMode = false } = await request.json();

    console.log("🚀 Starting job alerts process...");
    console.log("Test mode:", testMode);

    // Get all candidates or specific user
    const usersRef = adminDb.collection("users");
    let candidatesSnapshot;

    if (userId) {
      // Send to specific user
      const userDoc = await usersRef.doc(userId).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      candidatesSnapshot = { docs: [userDoc] };
    } else {
      // Send to all candidates
      candidatesSnapshot = await usersRef
        .where("userType", "==", "Candidate")
        .get();
    }

    if (candidatesSnapshot.empty) {
      console.log("No candidates found");
      return NextResponse.json({ message: "No candidates found" });
    }

    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;
    const results = [];

    // Process each candidate
    for (const userDoc of candidatesSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        // Check if user has job alerts enabled
        const alertsSnapshot = await adminDb
          .collection(`users/${userId}/jobAlerts`)
          .where("status", "==", "active")
          .get();

        if (alertsSnapshot.empty) {
          console.log(`No active job alerts for user ${userId}`);
          results.push({
            userId,
            email: userData.email,
            status: "skipped",
            reason: "No active job alerts",
          });
          continue;
        }

        // Get the first active alert (assuming one alert per user for now)
        const alertData = alertsSnapshot.docs[0].data();

        // Get matching jobs
        const matchingJobs = await getMatchingJobs(alertData);

        if (matchingJobs.length === 0) {
          console.log(`No matching jobs found for user ${userId}`);
          results.push({
            userId,
            email: userData.email,
            status: "skipped",
            reason: "No matching jobs",
          });
          continue;
        }

        // Send job alert email (unless in test mode)
        let emailSent = true;
        if (!testMode) {
          emailSent = await sendJobAlertEmail(
            userData.email,
            userData.name || userData.email.split("@")[0],
            matchingJobs
          );
        }

        if (emailSent) {
          totalEmailsSent++;
          console.log(`✅ Job alert sent to ${userData.email}`);
          results.push({
            userId,
            email: userData.email,
            status: "sent",
            jobsCount: matchingJobs.length,
          });
        } else {
          totalEmailsFailed++;
          console.log(`❌ Failed to send job alert to ${userData.email}`);
          results.push({
            userId,
            email: userData.email,
            status: "failed",
            reason: "Email sending failed",
          });
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        totalEmailsFailed++;
        results.push({
          userId,
          email: userData.email,
          status: "error",
          reason: error.message,
        });
      }
    }

    console.log(`🎉 Job alerts process completed!`);
    console.log(`📧 Total emails sent: ${totalEmailsSent}`);
    console.log(`❌ Total emails failed: ${totalEmailsFailed}`);

    return NextResponse.json({
      success: true,
      emailsSent: totalEmailsSent,
      emailsFailed: totalEmailsFailed,
      results,
      testMode,
    });
  } catch (error) {
    console.error("💥 Error in send-job-alerts API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
