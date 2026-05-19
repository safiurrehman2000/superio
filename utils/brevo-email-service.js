import * as SibApiV3Sdk from '@getbrevo/brevo';
import {
  brevoApiInstance,
  BREVO_CONFIG,
  createJobAlertEmailContent,
  createVerificationEmailContent,
  createWelcomeEmailContent,
} from './brevo-config.js';

/**
 * Brevo's JS SDK uses axios; failed responses put the API JSON in `error.response.data`.
 * Some paths throw `HttpError` with `body` instead.
 */
function extractBrevoApiError(error) {
  const status =
    error?.response?.status ??
    error?.response?.statusCode ??
    error?.statusCode ??
    error?.status ??
    'UNKNOWN';

  let message = error?.message || 'Unknown Brevo error';

  const axiosData = error?.response?.data;
  const httpErrorBody = error?.body;
  const legacyBody = error?.response?.body;

  function parsePayload(payload) {
    if (payload == null) return null;
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return payload.trim() || null;
      }
    }
    if (typeof payload === 'object') return payload;
    return null;
  }

  const parsed =
    parsePayload(axiosData) ??
    parsePayload(httpErrorBody) ??
    parsePayload(legacyBody);

  if (parsed && typeof parsed === 'object') {
    const m = parsed.message;
    if (Array.isArray(m)) {
      message = m.map(String).join('; ');
    } else if (m != null) {
      message = String(m);
    } else if (parsed.error != null) {
      message = String(parsed.error);
    } else if (parsed.code != null && Object.keys(parsed).length <= 3) {
      message = JSON.stringify(parsed);
    }
  } else if (typeof parsed === 'string' && parsed) {
    message = parsed;
  }

  const generic =
    /^Request failed with status code \d+$/i.test(message) ||
    /^HTTP request failed$/i.test(message);
  if (generic && parsed && typeof parsed === 'object') {
    message = JSON.stringify(parsed);
  }

  return { errorMessage: String(message), errorCode: status };
}

/**
 * Brevo returns 400 "name is missing in to" if recipient `name` is empty.
 */
function toRecipient(email, name) {
  const e = String(email || '').trim();
  const localPart = e.includes('@') ? e.split('@')[0] : e || 'user';
  const n = (name && String(name).trim()) || localPart || 'Recipient';
  return { email: e, name: n };
}

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
    const messageId = response?.body?.messageId || response?.messageId || null;
    const requestId =
      response?.response?.headers?.['sib-request-id'] ||
      response?.response?.headers?.['SIB-REQUEST-ID'] ||
      null;
    console.log('✅ Brevo email sent successfully:', {
      to: emailData.to,
      subject: emailData.subject,
      messageId,
      requestId,
      statusCode: response?.response?.statusCode || null,
    });
    return { success: true, messageId, requestId };
  } catch (error) {
    const { errorMessage, errorCode } = extractBrevoApiError(error);
    console.error('❌ Error sending Brevo email:', {
      errorCode,
      errorMessage,
      raw: error?.response?.data ?? error?.body ?? error?.response?.body ?? null,
    });
    return { success: false, errorCode, errorMessage };
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
  userName = '',
  jobs = [],
  alertKeywords = '',
) => {
  try {
    if (!jobs || jobs.length === 0) {
      console.log('No jobs to send in alert');
      return false;
    }

    // Create email content
    const htmlContent = createJobAlertEmailContent(
      userName,
      jobs,
      alertKeywords,
    );

    // Prepare email data
    const emailData = {
      to: [toRecipient(userEmail, userName)],
      subject: `🎯 ${jobs.length} New Job Opportunity${
        jobs.length > 1 ? 'ies' : ''
      } - Flexijobber`,
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    // Send email
    const result = await sendBrevoEmail(emailData);
    if (!result.success) {
      console.error(
        `❌ Job alert email failed for ${userEmail}:`,
        result.errorMessage,
      );
      return false;
    }
    console.log(`✅ Job alert email sent successfully to: ${userEmail}`);
    console.log(`📧 Jobs included: ${jobs.length}`);
    console.log(`📧 Message ID: ${result.messageId || 'N/A'}`);
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
export const sendVerificationCodeEmailBrevo = async (
  userEmail,
  code,
  userType = 'Candidate',
) => {
  try {
    const htmlContent = createVerificationEmailContent(code, userType);
    const emailData = {
      to: [toRecipient(userEmail)],
      subject: `${code} is uw verificatiecode – De Flexijobber`,
      htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    if (!result.success) {
      console.error(
        `Verification email failed for ${userEmail}:`,
        result.errorMessage,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error sending verification email to ${userEmail}:`, error);
    return false;
  }
};

export const sendWelcomeEmailBrevo = async (
  userEmail,
  userName = '',
  userType = 'User',
) => {
  try {
    const htmlContent = createWelcomeEmailContent(userType);
    const isCandidate = userType === 'Candidate';
    const subject = isCandidate
      ? 'Welkom bij De Flexijobber – start met solliciteren!'
      : 'Welkom bij De Flexijobber – uw account is klaar!';

    const emailData = {
      to: [toRecipient(userEmail, userName)],
      subject,
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    if (!result.success) {
      console.error(
        `❌ Welcome email failed for ${userEmail}:`,
        result.errorMessage,
      );
      return false;
    }
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
  candidateName = '',
  jobTitle = '',
  companyName = '',
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
            <h3>Hello ${candidateName || 'there'}!</h3>
            <p>Thank you for applying to a position through Flexijobber. Your application has been submitted successfully.</p>
            
            <div class="job-info">
              <h4>Application Details:</h4>
              <p><strong>Job Title:</strong> ${jobTitle || 'N/A'}</p>
              <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
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
      to: [toRecipient(candidateEmail, candidateName)],
      subject: '✅ Application Submitted - Flexijobber',
      htmlContent: htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    if (!result.success) {
      console.error(
        `❌ Application confirmation email failed for ${candidateEmail}:`,
        result.errorMessage,
      );
      return false;
    }
    console.log(
      `✅ Application confirmation email sent successfully to: ${candidateEmail}`,
    );
    return true;
  } catch (error) {
    console.error(
      `💥 Error sending application confirmation email to ${candidateEmail}:`,
      error,
    );
    return false;
  }
};

/**
 * Send new application notification email to employer
 * @param {string} employerEmail - Employer email address
 * @param {string} employerName - Employer name
 * @param {Object} payload - Application payload
 * @returns {Promise<{ success: boolean, errorMessage?: string, errorCode?: string }>}
 */
export const sendEmployerApplicationNotificationBrevo = async (
  employerEmail,
  employerName = '',
  payload = {},
) => {
  try {
    const {
      candidateName = 'A candidate',
      candidateEmail = '',
      jobTitle = 'your job posting',
      candidateMessage = '',
      resumeFileName = '',
      applicationId = '',
    } = payload || {};

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New CV/Application Received - Flexijobber</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 20px; border: 1px solid #ddd; }
          .info { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 16px 0; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 New CV/Application Received</h1>
            <p>A candidate has applied to your job post</p>
          </div>
          <div class="content">
            <p>Hello ${employerName || 'there'},</p>
            <p>You have received a new application on Flexijobber.</p>
            <div class="info">
              <p><strong>Job:</strong> ${jobTitle}</p>
              <p><strong>Candidate:</strong> ${candidateName}</p>
              ${
                candidateEmail
                  ? `<p><strong>Candidate email:</strong> ${candidateEmail}</p>`
                  : ''
              }
              ${
                resumeFileName
                  ? `<p><strong>CV file:</strong> ${resumeFileName}</p>`
                  : ''
              }
              ${
                applicationId
                  ? `<p><strong>Application ID:</strong> ${applicationId}</p>`
                  : ''
              }
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${
              candidateMessage
                ? `<p><strong>Candidate message:</strong><br>${candidateMessage}</p>`
                : ''
            }
            <p>Please log in to your employer dashboard to review the full profile and CV.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Flexijobber Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailData = {
      to: [toRecipient(employerEmail, employerName)],
      // Plain ASCII subject — some providers reject emoji / special chars in subject
      subject: `New application: ${jobTitle} (Flexijobber)`,
      htmlContent,
      senderName: BREVO_CONFIG.senderName,
      senderEmail: BREVO_CONFIG.senderEmail,
      replyTo: BREVO_CONFIG.replyToEmail,
    };

    const result = await sendBrevoEmail(emailData);
    if (!result.success) {
      console.error(
        `❌ Employer application notification failed for ${employerEmail}:`,
        result.errorMessage,
      );
      return {
        success: false,
        errorMessage: result.errorMessage,
        errorCode: result.errorCode,
      };
    }
    console.log(
      `✅ Employer application notification sent successfully to: ${employerEmail}`,
    );
    return { success: true };
  } catch (error) {
    const { errorMessage, errorCode } = extractBrevoApiError(error);
    console.error(
      `💥 Error sending employer application notification to ${employerEmail}:`,
      errorMessage,
    );
    return { success: false, errorMessage, errorCode };
  }
};
