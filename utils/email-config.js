// EmailJS configuration
export const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_pxzdz12",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_ze5clom",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "spX-U3xAiU17jg7yz",
};

// Email template IDs for different types of emails
export const EMAIL_TEMPLATES = {
  WELCOME:
    process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID || "template_ze5clom",
  JOB_ALERT: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_ze5clom",
};
