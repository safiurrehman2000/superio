import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import { sendWelcomeEmailBrevo } from '@/utils/brevo-email-service';
import { buildUserProfile } from '@/utils/createUserProfile';
import {
  emailVerificationDocId,
  hashOtpCode,
  normalizeEmail,
} from '@/utils/emailVerification';

const ALLOWED_TYPES = ['Candidate', 'Employer'];

export async function POST(request) {
  try {
    const { email, password, userType, code } = await request.json();
    const normalized = normalizeEmail(email);

    if (!normalized || !password || !code) {
      return NextResponse.json(
        { error: 'Email, password, and verification code are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    const docRef = adminDb
      .collection('emailVerifications')
      .doc(emailVerificationDocId(normalized));
    const verificationDoc = await docRef.get();

    if (!verificationDoc.exists) {
      return NextResponse.json(
        { error: 'Geen verificatiecode gevonden. Vraag een nieuwe code aan.' },
        { status: 400 },
      );
    }

    const verification = verificationDoc.data();
    const expiresAt = verification.expiresAt?.toDate?.()
      ? verification.expiresAt.toDate()
      : new Date(verification.expiresAt);

    if (Date.now() > expiresAt.getTime()) {
      await docRef.delete();
      return NextResponse.json(
        { error: 'De code is verlopen. Vraag een nieuwe code aan.' },
        { status: 400 },
      );
    }

    if (verification.userType !== userType) {
      return NextResponse.json(
        { error: 'Accounttype komt niet overeen. Start opnieuw.' },
        { status: 400 },
      );
    }

    const attempts = verification.attempts || 0;
    if (attempts >= (verification.maxAttempts || 5)) {
      await docRef.delete();
      return NextResponse.json(
        { error: 'Te veel pogingen. Vraag een nieuwe code aan.' },
        { status: 400 },
      );
    }

    if (verification.codeHash !== hashOtpCode(String(code).trim())) {
      await docRef.update({ attempts: attempts + 1 });
      return NextResponse.json(
        { error: 'Onjuiste verificatiecode.' },
        { status: 400 },
      );
    }

    await docRef.delete();

    let uid;
    let repaired = false;

    try {
      const existing = await admin.auth().getUserByEmail(normalized);
      uid = existing.uid;
      repaired = true;

      await admin.auth().updateUser(uid, {
        password,
        emailVerified: true,
      });
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;

      const created = await admin.auth().createUser({
        email: normalized,
        password,
        emailVerified: true,
      });
      uid = created.uid;
    }

    const userRef = adminDb.collection('users').doc(uid);
    const profileSnap = await userRef.get();

    if (!profileSnap.exists) {
      await userRef.set(
        buildUserProfile({
          email: normalized,
          userType,
          createdBy: repaired ? 'auth_repair' : 'email_verification',
          emailVerified: true,
        }),
      );
    }

    try {
      await sendWelcomeEmailBrevo(
        normalized,
        normalized.split('@')[0],
        userType,
      );
    } catch (emailError) {
      console.error('Welcome email failed after registration:', emailError);
    }

    return NextResponse.json({
      success: true,
      uid,
      repaired,
      message: repaired
        ? 'Account gerepareerd. U kunt nu inloggen.'
        : 'Account aangemaakt. U kunt nu inloggen.',
    });
  } catch (error) {
    console.error('verify-and-register error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
