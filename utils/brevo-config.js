// Brevo (formerly Sendinblue) configuration
import * as SibApiV3Sdk from "@getbrevo/brevo";

// Initialize Brevo API client
export const brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure API key
const apiKey = (process.env.BREVO_API_KEY || "").trim();
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
  senderEmail:
    (process.env.BREVO_SENDER_EMAIL || "").trim() ||
    "noreply@de-flexi-jobber.be",
  senderName: (process.env.BREVO_SENDER_NAME || "").trim() || "Flexijobber",
  replyToEmail:
    (process.env.BREVO_REPLY_TO_EMAIL || "").trim() ||
    "info@horecabenelux.com",
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

const WELCOME_EMAIL_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://de-flexi-jobber.be";

const welcomeEmailContactFooter = `
  <p style="color: #666; line-height: 1.6; font-size: 16px; margin-top: 24px;">
    <a href="mailto:info@de-flexi-jobber.be" style="color: #1967d2; font-weight: bold; text-decoration: underline;">info@de-flexi-jobber.be</a>
  </p>
  <ul style="color: #666; line-height: 1.8; font-size: 16px; padding-left: 20px;">
    <li>WhatsApp 0491 100 143 of via de chat: Algemene vragen?</li>
    <li>Automatisch vacature plaatsen werkgevers via de chat: Direct vacature plaatsen</li>
    <li>Contactformulier via de website.</li>
  </ul>
`;

/** Dutch welcome email HTML for employers and candidates */
export const createWelcomeEmailContent = (userType = "User") => {
  const isCandidate = userType === "Candidate";
  const dashboardUrl = isCandidate
    ? `${WELCOME_EMAIL_BASE_URL}/candidates-dashboard/applied-jobs`
    : `${WELCOME_EMAIL_BASE_URL}/employers-dashboard/dashboard`;

  const employerBody = `
    <h2 style="color: #333; margin-top: 0;">Beste Werkgever,</h2>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Bedankt voor uw registratie bij De Flexijobber. Wij helpen u graag bij het vinden van gemotiveerde versterking voor uw team.
    </p>
    <p style="color: #666; line-height: 1.6; font-size: 16px; font-weight: bold;">Wat kunt u nu doen?</p>
    <ul style="color: #666; line-height: 1.8; font-size: 16px;">
      <li><strong>Plaats een vacature:</strong> Trek direct de aandacht van actieve flexijobbers.</li>
      <li><strong>Uw dashboard:</strong> Beheer uw vacatures en volg binnengekomen sollicitaties eenvoudig op één centrale plek.</li>
    </ul>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Heeft u hulp nodig bij het opstarten? Wij kijken mee via uw account om alles vlot te laten verlopen.
    </p>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Gebruik de Whats-app knop voor onmiddellijk contact op al jouw vragen!
    </p>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Met vriendelijke groet,<br />
      Team De Flexijobber
    </p>
  `;

  const candidateBody = `
    <h2 style="color: #333; margin-top: 0;">Beste Kandidaat,</h2>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Welkom bij de community! Vanaf nu is het vinden van de perfecte flexijob of studentenjob makkelijker dan ooit. Jouw profiel staat klaar, dus je kunt direct aan de slag:
    </p>
    <ul style="color: #666; line-height: 1.8; font-size: 16px;">
      <li><strong>Solliciteer direct:</strong> Bekijk vacatures die bij jou passen en reageer met één klik.</li>
      <li><strong>Beheer je profiel:</strong> Houd je gegevens up-to-date via jouw persoonlijke dashboard.</li>
      <li><strong>Volg alles op:</strong> In je dashboard zie je precies wat de status van je sollicitaties is.</li>
    </ul>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Gebruik de Whats-app knop voor onmiddellijk contact op al jouw vragen!
    </p>
    <p style="color: #666; line-height: 1.6; font-size: 16px;">
      Veel succes met je zoektocht!<br />
      Team De Flexijobber
    </p>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welkom bij De Flexijobber!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1967d2; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welkom bij De Flexijobber!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${isCandidate ? candidateBody : employerBody}
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardUrl}" style="background-color: #1967d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
              Ga naar jouw dashboard
            </a>
          </div>
          ${welcomeEmailContactFooter}
        </div>
        <p style="text-align: center; padding: 20px; color: #999; font-size: 14px; margin: 0;">
          © ${new Date().getFullYear()} De Flexijobber
        </p>
      </div>
    </body>
    </html>
  `;
};

export const createVerificationEmailContent = (code, userType) => {
  const roleLabel = userType === 'Employer' ? 'werkgever' : 'kandidaat';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bevestig uw e-mailadres</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1967d2; color: white; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">Bevestig uw e-mailadres</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #666; font-size: 16px;">
            U registreert zich als <strong>${roleLabel}</strong> bij De Flexijobber.
            Gebruik onderstaande code om uw registratie te voltooien. De code is 10 minuten geldig.
          </p>
          <p style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #1967d2; background: #f0f4ff; padding: 16px 24px; border-radius: 8px;">
              ${code}
            </span>
          </p>
          <p style="color: #999; font-size: 14px;">
            Als u dit niet heeft aangevraagd, kunt u deze e-mail negeren.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
