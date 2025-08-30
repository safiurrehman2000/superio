import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";
import { sendJobAlertEmailBrevo } from "@/utils/brevo-email-service";

/**
 * Send job alert email to a candidate
 */
const sendJobAlertEmail = async (
  userEmail,
  userName,
  jobs = [],
  alertKeywords = ""
) => {
  return await sendJobAlertEmailBrevo(userEmail, userName, jobs, alertKeywords);
};

/**
 * Get recent jobs that match candidate preferences
 */
const getMatchingJobs = async (alertData) => {
  try {
    const jobsRef = adminDb.collection("jobs");
    let query = jobsRef.where("status", "==", "active");

    // Filter by date (last 30 days to be more lenient for testing)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();
    console.log(
      `📅 Looking for jobs created after: ${thirtyDaysAgo.toISOString()} (${thirtyDaysAgoTimestamp})`
    );
    query = query.where("createdAt", ">=", thirtyDaysAgoTimestamp);

    const snapshot = await query.get();
    let jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 Total jobs found: ${jobs.length}`);
    if (jobs.length > 0) {
      console.log(`📋 Sample job:`, {
        id: jobs[0].id,
        title: jobs[0].title,
        tags: jobs[0].tags,
        location: jobs[0].location,
        createdAt: jobs[0].createdAt,
      });
    }

    // Filter by categories in memory
    if (alertData.categories && alertData.categories.length > 0) {
      jobs = jobs.filter(
        (job) =>
          job.tags && job.tags.some((tag) => alertData.categories.includes(tag))
      );
      console.log(`🏷️  After category filter: ${jobs.length} jobs`);
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
      console.log(`🔍 Keywords to search for:`, keywords);

      jobs = jobs.filter((job) => {
        const jobText = [
          job.title || "",
          job.description || "",
          ...(job.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        const matches = keywords.some(
          (keyword) => keyword && jobText.includes(keyword)
        );

        if (matches) {
          console.log(`✅ Job "${job.title}" matches keywords:`, keywords);
        }

        return matches;
      });
      console.log(`🔍 After keyword filter: ${jobs.length} jobs`);
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

        // Debug logging
        console.log(`🔍 Debug for user ${userId}:`);
        console.log(`  - Alert data:`, alertData);
        console.log(`  - Matching jobs found:`, matchingJobs.length);
        if (matchingJobs.length > 0) {
          console.log(`  - First job:`, matchingJobs[0]);
        }

        if (matchingJobs.length === 0) {
          console.log(`No matching jobs found for user ${userId}`);
          results.push({
            userId,
            email: userData.email,
            status: "skipped",
            reason: "No matching jobs",
            debug: {
              alertData,
              totalJobsChecked: 0, // We'll add this later
            },
          });
          continue;
        }

        // Send job alert email (unless in test mode)
        let emailSent = true;
        if (!testMode) {
          emailSent = await sendJobAlertEmail(
            userData.email,
            userData.name || userData.email.split("@")[0],
            matchingJobs,
            alertData.keywords || ""
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
