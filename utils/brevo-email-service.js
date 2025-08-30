import * as SibApiV3Sdk from "@getbrevo/brevo";
import {
  brevoApiInstance,
  BREVO_CONFIG,
  createJobAlertEmailContent,
} from "./brevo-config.js";

/**
 * Send email using Brevo API
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} - API response
 */
export const sendBrevoEmail = async (emailData) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set email properties
    sendSmtpEmail.to = emailData.to;
    sendSmtpEmail.subject = emailData.subject;
    sendSmtpEmail.htmlContent = emailData.htmlContent;
    sendSmtpEmail.sender = {
      name: emailData.senderName || BREVO_CONFIG.senderName,
      email: emailData.senderEmail || BREVO_CONFIG.senderEmail,
    };

    // Set reply-to if provided
    if (emailData.replyTo) {
      sendSmtpEmail.replyTo = {
        name: emailData.replyToName || BREVO_CONFIG.senderName,
        email: emailData.replyTo,
      };
    }

    // Send the email
    const response = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Brevo email sent successfully:", response);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error("❌ Error sending Brevo email:", error);
    throw error;
  }
};

/**
 * Send job alert email using Brevo
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @param {string} alertKeywords - Alert keywords
 * @returns {Promise<boolean>} - Success status
 */
export const sendJobAlertEmailBrevo = async (
  userEmail,
  userName = "",
  jobs = [],
  alertKeywords = ""
) => {
  try {
    if (!jobs || jobs.length === 0) {
      console.log("No jobs to send in alert");
      return false;
    }

    // Create email content
    const htmlContent = createJobAlertEmailContent(
      userName,
      jobs,
      alertKeywords
    );

    // Prepare email data
    const emailData = {
      to: [{ email: userEmail, name: userName }],
      subject: `🎯 ${jobs.length} New Job Opportunity${
        jobs.length > 1 ? "ies" : ""
      } - Flexijobber`,
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    // Send email
    const result = await sendBrevoEmail(emailData);

    console.log(`✅ Job alert email sent successfully to: ${userEmail}`);
    console.log(`📧 Jobs included: ${jobs.length}`);
    console.log(`📧 Message ID: ${result.messageId}`);

    return true;
  } catch (error) {
    console.error(`💥 Error sending job alert email to ${userEmail}:`, error);
    return false;
  }
};

/**
 * Send welcome email using Brevo
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} userType - Type of user (Candidate/Employer)
 * @returns {Promise<boolean>} - Success status
 */
export const sendWelcomeEmailBrevo = async (
  userEmail,
  userName = "",
  userType = "User"
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Flexijobber!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 20px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Flexijobber!</h1>
            <p>Your account has been successfully created</p>
          </div>
          
          <div class="content">
            <h3>Hello ${userName || "there"}!</h3>
            <p>Welcome to Flexijobber! We're excited to have you on board as a <strong>${userType}</strong>.</p>
            
            <p>Here's what you can do next:</p>
            <ul>
              ${
                userType === "Candidate"
                  ? `
                <li>Complete your profile and upload your resume</li>
                <li>Browse available job opportunities</li>
                <li>Set up job alerts to get notified about new positions</li>
                <li>Apply to jobs that match your skills and interests</li>
              `
                  : `
                <li>Complete your company profile</li>
                <li>Post job opportunities</li>
                <li>Browse candidate profiles</li>
                <li>Manage applications and interviews</li>
              `
              }
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/dashboard" class="btn">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Flexijobber Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      to: [{ email: userEmail, name: userName }],
      subject: "🎉 Welcome to Flexijobber!",
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    console.log(`✅ Welcome email sent successfully to: ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`💥 Error sending welcome email to ${userEmail}:`, error);
    return false;
  }
};

/**
 * Send application confirmation email using Brevo
 * @param {string} candidateEmail - Candidate's email address
 * @param {string} candidateName - Candidate's name
 * @param {string} jobTitle - Job title
 * @param {string} companyName - Company name
 * @returns {Promise<boolean>} - Success status
 */
export const sendApplicationConfirmationBrevo = async (
  candidateEmail,
  candidateName = "",
  jobTitle = "",
  companyName = ""
) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Submitted - Flexijobber</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 20px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
          .job-info { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Application Submitted!</h1>
            <p>Your job application has been successfully submitted</p>
          </div>
          
          <div class="content">
            <h3>Hello ${candidateName || "there"}!</h3>
            <p>Thank you for applying to a position through Flexijobber. Your application has been submitted successfully.</p>
            
            <div class="job-info">
              <h4>Application Details:</h4>
              <p><strong>Job Title:</strong> ${jobTitle || "N/A"}</p>
              <p><strong>Company:</strong> ${companyName || "N/A"}</p>
              <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>The employer will review your application and contact you if you're selected for an interview.</p>
            
            <p>You can track your application status in your dashboard.</p>
          </div>
          
          <div class="footer">
            <p>Good luck with your application!</p>
            <p>Best regards,<br>The Flexijobber Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      to: [{ email: candidateEmail, name: candidateName }],
      subject: "✅ Application Submitted - Flexijobber",
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    console.log(
      `✅ Application confirmation email sent successfully to: ${candidateEmail}`
    );
    return true;
  } catch (error) {
    console.error(
      `💥 Error sending application confirmation email to ${candidateEmail}:`,
      error
    );
    return false;
  }
};
