import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import { sendVerificationCodeEmailBrevo } from '@/utils/brevo-email-service';
import {
  emailVerificationDocId,
  generateOtpCode,
  hashOtpCode,
  normalizeEmail,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
} from '@/utils/emailVerification';

const ALLOWED_TYPES = ['Candidate', 'Employer'];

export async function POST(request) {
  try {
    const { email, userType } = await request.json();
    const normalized = normalizeEmail(email);

    if (!normalized || !normalized.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    let authUser = null;
    try {
      authUser = await admin.auth().getUserByEmail(normalized);
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;
    }

    if (authUser) {
      const profile = await adminDb.collection('users').doc(authUser.uid).get();
      if (profile.exists) {
        return NextResponse.json(
          {
            error:
              'Dit e-mailadres is al geregistreerd. Log in of gebruik wachtwoord vergeten.',
          },
          { status: 409 },
        );
      }
    }

    const docId = emailVerificationDocId(normalized);
    const docRef = adminDb.collection('emailVerifications').doc(docId);
    const existing = await docRef.get();

    if (existing.exists) {
      const data = existing.data();
      const lastSent = data.lastSentAt?.toDate?.() || new Date(data.lastSentAt || 0);
      if (Date.now() - lastSent.getTime() < OTP_RESEND_COOLDOWN_MS) {
        return NextResponse.json(
          { error: 'Wacht even voordat u een nieuwe code aanvraagt.' },
          { status: 429 },
        );
      }
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const sent = await sendVerificationCodeEmailBrevo(normalized, code, userType);
    if (!sent) {
      return NextResponse.json(
        { error: 'Kon verificatie-e-mail niet verzenden. Probeer later opnieuw.' },
        { status: 502 },
      );
    }

    await docRef.set({
      email: normalized,
      userType,
      codeHash: hashOtpCode(code),
      expiresAt,
      lastSentAt: new Date(),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    });
  } catch (error) {
    console.error('send-verification-code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
