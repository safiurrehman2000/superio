import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";
import { sanitizeFormData } from "@/utils/sanitization";
import { sendEmployerApplicationNotificationBrevo } from "@/utils/brevo-email-service";

export async function POST(request) {
  try {
    const { candidateId, jobId, resumeId, message } = await request.json();

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { success: false, error: "candidateId and jobId are required" },
        { status: 400 }
      );
    }

    const fieldTypes = {
      candidateId: "candidateid",
      jobId: "text",
      resumeId: "text",
      message: "description",
    };
    const sanitizedPayload = sanitizeFormData(
      { candidateId, jobId, resumeId: resumeId || "", message: message || "" },
      fieldTypes
    );

    if (!sanitizedPayload.candidateId || !sanitizedPayload.jobId) {
      return NextResponse.json(
        { success: false, error: "Invalid application data" },
        { status: 400 }
      );
    }

    const existingSnap = await adminDb
      .collection("applications")
      .where("candidateId", "==", sanitizedPayload.candidateId)
      .where("jobId", "==", sanitizedPayload.jobId)
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      return NextResponse.json(
        { success: false, error: "You have already applied to this job." },
        { status: 409 }
      );
    }

    const applicationRef = await adminDb.collection("applications").add({
      candidateId: sanitizedPayload.candidateId,
      jobId: sanitizedPayload.jobId,
      resumeId: sanitizedPayload.resumeId || null,
      message: sanitizedPayload.message || "",
      appliedAt: Date.now(),
      status: "Active",
    });

    let employerEmailSent = false;
    try {
      const [jobSnap, candidateSnap] = await Promise.all([
        adminDb.collection("jobs").doc(sanitizedPayload.jobId).get(),
        adminDb.collection("users").doc(sanitizedPayload.candidateId).get(),
      ]);

      if (jobSnap.exists) {
        const jobData = jobSnap.data() || {};
        const employerId = jobData.employerId;
        if (employerId) {
          const employerSnap = await adminDb.collection("users").doc(employerId).get();
          if (employerSnap.exists) {
            const employerData = employerSnap.data() || {};
            const candidateData = candidateSnap.exists ? candidateSnap.data() || {} : {};

            let resumeFileName = "";
            if (sanitizedPayload.resumeId) {
              const resumeSnap = await adminDb
                .collection("users")
                .doc(sanitizedPayload.candidateId)
                .collection("resumes")
                .doc(sanitizedPayload.resumeId)
                .get();
              if (resumeSnap.exists) {
                const resumeData = resumeSnap.data() || {};
                resumeFileName = resumeData.fileName || "";
              }
            }

            if (employerData.email) {
              employerEmailSent = await sendEmployerApplicationNotificationBrevo(
                employerData.email,
                employerData.name || employerData.company_name || "",
                {
                  candidateName: candidateData.name || "Candidate",
                  candidateEmail: candidateData.email || "",
                  jobTitle: jobData.title || "your job posting",
                  candidateMessage: sanitizedPayload.message || "",
                  resumeFileName,
                  applicationId: applicationRef.id,
                }
              );
            }
          }
        }
      }
    } catch (emailError) {
      console.error("⚠️ Application saved but employer email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationRef.id,
      employerEmailSent,
    });
  } catch (error) {
    console.error("💥 Error creating application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
