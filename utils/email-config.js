// EmailJS configuration
export const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

// Email template IDs for different types of emails
export const EMAIL_TEMPLATES = {
  WELCOME: process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID,
  JOB_ALERT: process.env.NEXT_PUBLIC_EMAILJS_JOB_ALERT_TEMPLATE_ID,
};
