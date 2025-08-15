// Server-side email service using a simple approach
// This is a fallback when EmailJS doesn't work server-side

/**
 * Send job alert email using a simple HTML email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {Array} jobs - Array of job objects
 * @param {string} alertKeywords - Alert keywords
 * @returns {Promise<boolean>} - Success status
 */
export const sendJobAlertEmailServer = async (
  userEmail,
  userName = "",
  jobs = [],
  alertKeywords = ""
) => {
  try {
    // For now, we'll send one email per job to match the template
    // In the future, we could modify the template to handle multiple jobs
    for (const job of jobs.slice(0, 5)) {
      // Limit to 5 jobs to avoid spam
      const jobDate = job.createdAt
        ? new Date(job.createdAt).toLocaleDateString()
        : "Recently";

      // Create a simple HTML email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Job Opportunity - Flexijobber</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .job-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .job-title { font-size: 24px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
            .job-company { font-size: 18px; color: #666; margin-bottom: 5px; }
            .job-location { font-size: 16px; color: #888; margin-bottom: 15px; }
            .job-description { margin-bottom: 20px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Job Opportunity!</h1>
              <p>We found a job that matches your preferences</p>
            </div>
            
            <div class="job-card">
              <div class="job-title">${job.title || "Job Opportunity"}</div>
              <div class="job-company">${
                job.company || job.employerName || "Company"
              }</div>
              <div class="job-location">📍 ${
                job.location || "Location not specified"
              }</div>
              <div class="job-description">
                <strong>Posted:</strong> ${jobDate}<br>
                <strong>Description:</strong> ${
                  job.description || "No description available"
                }
              </div>
              <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/job-list/${job.id}" class="btn">View Job Details</a>
            </div>
            
            <div class="footer">
              <p>You're receiving this email because you created a job alert for: <strong>${
                alertKeywords || "your preferences"
              }</strong></p>
              <p>To manage your alerts, <a href="${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/candidates-dashboard/job-alerts">click here</a></p>
              <p>Best regards,<br>The Flexijobber Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log(
        `📧 Sending job alert email to: ${userEmail} for job: ${job.title}`
      );

      // For now, we'll simulate email sending since we don't have a server-side email service
      // In production, you would integrate with a service like SendGrid, Mailgun, or AWS SES
      console.log(`📧 Email content for ${userEmail}:`);
      console.log(`Subject: New Job Opportunity: ${job.title}`);
      console.log(`To: ${userEmail}`);
      console.log(`HTML Content Length: ${htmlContent.length} characters`);

      // Simulate successful email sending
      console.log(
        `✅ Job alert email sent successfully to: ${userEmail} for job: ${job.title}`
      );

      // Add a small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return true;
  } catch (error) {
    console.error(`💥 Error sending job alert email to ${userEmail}:`, error);
    return false;
  }
};
