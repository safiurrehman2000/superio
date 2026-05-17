import crypto from 'crypto';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export function generateOtpCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(OTP_LENGTH, '0');
}

function getOtpSecret() {
  return (
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    'dev-email-verification-secret'
  );
}

export function hashOtpCode(code) {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(String(code).trim())
    .digest('hex');
}

export function emailVerificationDocId(email) {
  return crypto
    .createHash('sha256')
    .update(normalizeEmail(email))
    .digest('hex');
}
