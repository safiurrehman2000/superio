import { NextResponse } from "next/server";
import {
  sendBrevoEmail,
  sendApplicationConfirmationBrevo,
  sendEmployerApplicationNotificationBrevo,
  sendJobAlertEmailBrevo,
} from "@/utils/brevo-email-service";

export async function POST(request) {
  try {
    const { email, name = "Test User" } = (await request.json()) || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "email is required" },
        { status: 400 }
      );
    }

    const runId = Date.now();
    const mockJobs = [
      {
        id: "test-job-1",
        title: `Test Barista (${runId})`,
        company: "Flexijobber Test Company",
        location: "Brussels",
        description:
          "This is a test job alert email from Flexijobber integration checks.",
        createdAt: Date.now(),
      },
      {
        id: "test-job-2",
        title: `Test Waiter (${runId})`,
        company: "Flexijobber Test Company",
        location: "Antwerp",
        description: "Second test job for alert rendering and delivery checks.",
        createdAt: Date.now(),
      },
    ];

    const debugProbe = await sendBrevoEmail({
      to: [{ email, name }],
      subject: `Flexijobber debug probe ${runId}`,
      htmlContent: `<p>Debug probe email for ${name}. Run ID: ${runId}</p>`,
    });

    const [jobAlertOk, applicationConfirmationOk, employerNotifyResult] =
      await Promise.all([
        sendJobAlertEmailBrevo(email, name, mockJobs, "horeca, part-time"),
        sendApplicationConfirmationBrevo(
          email,
          name,
          `Test Job Application (${runId})`,
          "Flexijobber Test Company"
        ),
        sendEmployerApplicationNotificationBrevo(email, name, {
          candidateName: "Test Candidate",
          candidateEmail: "candidate@example.com",
          jobTitle: "Test Hospitality Role",
          candidateMessage:
            "This is a test employer notification email from API.",
          resumeFileName: "test-resume.pdf",
          applicationId: `test-${runId}`,
        }),
      ]);

    const employerNotificationOk = Boolean(employerNotifyResult?.success);

    return NextResponse.json({
      success: jobAlertOk && applicationConfirmationOk && employerNotificationOk,
      results: {
        debugProbe: Boolean(debugProbe?.success),
        jobAlert: jobAlertOk,
        applicationConfirmation: applicationConfirmationOk,
        employerNotification: employerNotificationOk,
      },
      meta: {
        runId,
        debugProbeMessageId: debugProbe?.messageId || null,
        debugProbeRequestId: debugProbe?.requestId || null,
      },
      employerNotificationError:
        employerNotifyResult?.success === false
          ? {
              errorCode: employerNotifyResult?.errorCode || null,
              errorMessage: employerNotifyResult?.errorMessage || null,
            }
          : null,
    });
  } catch (error) {
    console.error("Error sending test emails:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
