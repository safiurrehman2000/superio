import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import { buildUserProfile, profileNeedsSetup } from '@/utils/createUserProfile';

const ALLOWED_TYPES = ['Candidate', 'Employer'];

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const { userType } = await request.json();

    if (!ALLOWED_TYPES.includes(userType)) {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(decoded.uid);
    const existing = await userRef.get();

    if (!profileNeedsSetup(existing)) {
      return NextResponse.json({
        success: true,
        created: false,
        uid: decoded.uid,
      });
    }

    const authUser = await admin.auth().getUser(decoded.uid);
    const profile = buildUserProfile({
      email: authUser.email || decoded.email || '',
      userType,
      createdBy: 'profile_repair',
      emailVerified: authUser.emailVerified,
    });

    await userRef.set(profile, { merge: true });

    return NextResponse.json({
      success: true,
      created: true,
      uid: decoded.uid,
      userType,
    });
  } catch (error) {
    console.error('ensure-user-profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 },
    );
  }
}
