import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';

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

    if (existing.exists) {
      return NextResponse.json({
        success: true,
        created: false,
        uid: authUser.uid,
        email: existing.data().email,
        message: 'Firestore profile already exists',
      });
    }

    const now = new Date();
    const profile = {
      email: authUser.email || email || '',
      userType,
      createdAt: now,
      isFirstTime: true,
      createdBy: 'admin_sync',
      lastUpdatedBy: authResult.user.uid,
      lastUpdatedAt: now,
    };

    if (userType === 'Admin') {
      profile.isFirstTime = false;
    }

    await userRef.set(profile);

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
