import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";

/**
 * Create a new job and trigger job alerts
 */
export async function POST(request) {
  try {
    const jobData = await request.json();

    // Add the job to Firestore
    const jobRef = await adminDb.collection("jobs").add({
      ...jobData,
      createdAt: Date.now(),
      status: "active",
    });

    console.log(`✅ Job created with ID: ${jobRef.id}`);

    // Trigger job alerts for this new job
    try {
      await triggerJobAlertsForNewJob(jobRef.id, jobData);
    } catch (alertError) {
      console.error("⚠️ Job alerts failed, but job was created:", alertError);
      // Don't fail the job creation if alerts fail
    }

    return NextResponse.json({
      success: true,
      jobId: jobRef.id,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("💥 Error creating job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Trigger job alerts for a newly created job
 */
async function triggerJobAlertsForNewJob(jobId, jobData) {
  try {
    console.log(`🔔 Triggering job alerts for new job: ${jobId}`);

    // Get all candidates with active job alerts
    const usersRef = adminDb.collection("users");
    const candidatesSnapshot = await usersRef
      .where("userType", "==", "Candidate")
      .get();

    if (candidatesSnapshot.empty) {
      console.log("No candidates found for job alerts");
      return;
    }

    let alertsTriggered = 0;

    // Check each candidate's job alerts
    for (const userDoc of candidatesSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        // Get user's job alerts
        const alertsSnapshot = await adminDb
          .collection(`users/${userId}/jobAlerts`)
          .where("status", "==", "active")
          .get();

        if (alertsSnapshot.empty) {
          continue;
        }

        // Check if this job matches any of the user's alerts
        const alertData = alertsSnapshot.docs[0].data();
        const isMatch = checkJobMatch(jobData, alertData);

        if (isMatch) {
          console.log(`🎯 Job ${jobId} matches alert for user ${userId}`);

          // Send immediate job alert email
          await sendImmediateJobAlert(userData, [jobData], alertData.keywords);
          alertsTriggered++;
        }
      } catch (error) {
        console.error(`Error checking alerts for user ${userId}:`, error);
      }
    }

    console.log(`📧 Triggered ${alertsTriggered} immediate job alerts`);
  } catch (error) {
    console.error("💥 Error triggering job alerts:", error);
    throw error;
  }
}

/**
 * Check if a job matches a user's alert preferences
 */
function checkJobMatch(job, alertData) {
  // Check categories/tags
  if (alertData.categories && alertData.categories.length > 0) {
    const hasMatchingCategory =
      job.tags && job.tags.some((tag) => alertData.categories.includes(tag));
    if (!hasMatchingCategory) return false;
  }

  // Check location
  if (alertData.locations && alertData.locations.length > 0) {
    if (!alertData.locations.includes(job.location)) return false;
  }

  // Check keywords
  if (alertData.keywords && alertData.keywords.trim()) {
    const keywords = alertData.keywords
      .toLowerCase()
      .split(",")
      .map((k) => k.trim());
    const jobText = [
      job.title || "",
      job.description || "",
      ...(job.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    const hasMatchingKeyword = keywords.some(
      (keyword) => keyword && jobText.includes(keyword)
    );
    if (!hasMatchingKeyword) return false;
  }

  return true;
}

/**
 * Send immediate job alert email
 */
async function sendImmediateJobAlert(userData, jobs, alertKeywords) {
  try {
    // Import the Brevo email service
    const { sendJobAlertEmailBrevo } = await import(
      "@/utils/brevo-email-service"
    );

    const emailSent = await sendJobAlertEmailBrevo(
      userData.email,
      userData.name || userData.email.split("@")[0],
      jobs,
      alertKeywords || ""
    );

    if (emailSent) {
      console.log(`✅ Immediate job alert sent to: ${userData.email}`);
    } else {
      console.log(
        `❌ Failed to send immediate job alert to: ${userData.email}`
      );
    }
  } catch (error) {
    console.error(
      `💥 Error sending immediate job alert to ${userData.email}:`,
      error
    );
  }
}
