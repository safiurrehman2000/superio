import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import { buildUserProfile, profileNeedsSetup } from '@/utils/createUserProfile';

const ALLOWED_TYPES = ['Candidate', 'Employer', 'Admin'];

export async function POST(request) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { uid, email, userType = 'Employer' } = await request.json();

    if (!ALLOWED_TYPES.includes(userType)) {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    let authUser;
    if (uid) {
      authUser = await admin.auth().getUser(uid);
    } else if (email) {
      authUser = await admin.auth().getUserByEmail(email);
    } else {
      return NextResponse.json(
        { error: 'uid or email is required' },
        { status: 400 },
      );
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);
    const existing = await userRef.get();

    if (!profileNeedsSetup(existing)) {
      return NextResponse.json({
        success: true,
        created: false,
        uid: authUser.uid,
        email: existing.data().email,
        message: 'Firestore profile already exists',
      });
    }

    const profile = buildUserProfile({
      email: authUser.email || email || '',
      userType,
      createdBy: 'admin_sync',
      emailVerified: authUser.emailVerified,
    });
    profile.lastUpdatedBy = authResult.user.uid;

    if (userType === 'Admin') {
      profile.isFirstTime = false;
    }

    await userRef.set(profile, { merge: true });

    return NextResponse.json({
      success: true,
      created: true,
      uid: authUser.uid,
      email: profile.email,
      userType,
    });
  } catch (error) {
    console.error('admin/sync-auth-user error:', error);
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'No Firebase Auth user found for that uid/email' },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
