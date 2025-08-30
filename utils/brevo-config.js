// Brevo (formerly Sendinblue) configuration
import * as SibApiV3Sdk from "@getbrevo/brevo";

// Initialize Brevo API client
export const brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure API key
const apiKey = process.env.BREVO_API_KEY;
console.log(
  "🔑 Brevo API Key check:",
  apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND"
);

if (!apiKey) {
  console.error("❌ BREVO_API_KEY environment variable is not set!");
} else if (!apiKey.startsWith("xkeysib-")) {
  console.error('❌ BREVO_API_KEY does not start with "xkeysib-"');
} else {
  console.log("✅ Brevo API Key format looks correct");
}

brevoApiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  apiKey
);

// Email configuration
export const BREVO_CONFIG = {
  senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@de-flexi-jobber.be",
  senderName: process.env.BREVO_SENDER_NAME || "Flexijobber",
  replyToEmail: process.env.BREVO_REPLY_TO_EMAIL || "info@horecabenelux.com",
};

// Email template IDs (you can create these in Brevo dashboard)
export const BREVO_TEMPLATES = {
  JOB_ALERT: process.env.BREVO_JOB_ALERT_TEMPLATE_ID || 1, // Default template ID
  WELCOME: process.env.BREVO_WELCOME_TEMPLATE_ID || 2,
  APPLICATION_CONFIRMATION: process.env.BREVO_APPLICATION_TEMPLATE_ID || 3,
};

// Helper function to create email content
export const createJobAlertEmailContent = (userName, jobs, alertKeywords) => {
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
                 <a href="${
                   process.env.NEXT_PUBLIC_BASE_URL ||
                   "https://de-flexi-jobber.be"
                 }/job-list/${job.id}"  
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
            <a href="${
              process.env.NEXT_PUBLIC_BASE_URL || "https://de-flexi-jobber.be"
            }/candidates-dashboard/job-alerts" 
               style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
              Manage Your Job Alerts
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you created a job alert for: <strong>${
            alertKeywords || "your preferences"
          }</strong></p>
          <p>To unsubscribe or manage your alerts, <a href="${
            process.env.NEXT_PUBLIC_BASE_URL || "https://de-flexi-jobber.be"
          }/candidates-dashboard/job-alerts">click here</a></p>
          <p>Best regards,<br>The Flexijobber Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
