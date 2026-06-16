import { adminDb } from '@/utils/firebase-admin';
import admin from 'firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import {
  isFirestoreQuotaError,
  quotaExceededResponse,
} from '@/utils/firestore-errors';

const MAX_SCAN = 250;

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  return new Date(value).getTime() || 0;
}

function mapUserDoc(doc) {
  const userData = doc.data();
  return {
    id: doc.id,
    uid: doc.id,
    email: userData.email || '',
    userType: userData.userType || '',
    name: userData.name || '',
    company_name: userData.company_name || '',
    phone: userData.phone || userData.phone_number || '',
    createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
    subscriptionStatus: userData.subscriptionStatus || 'none',
    planId: userData.planId || null,
    isFirstTime: userData.isFirstTime ?? true,
    hasPostedJob: userData.hasPostedJob || false,
  };
}

/**
 * GET /api/admin/list-users
 * Lists users (newest first) with pagination and filtering.
 */
export async function GET(request) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 50);
    const userType = searchParams.get('userType');
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = searchParams.get('status');

    let queryRef = adminDb.collection('users');

    if (userType) {
      queryRef = queryRef.where('userType', '==', userType);
    }

    const snapshot = await queryRef
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(MAX_SCAN)
      .get();

    let users = snapshot.docs.map(mapUserDoc);

    if (status) {
      users = users.filter((u) => u.subscriptionStatus === status);
    }

    if (search) {
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search) ||
          (u.company_name && u.company_name.toLowerCase().includes(search)),
      );
    }

    users.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    const totalUsers = users.length;
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
    const offset = (page - 1) * limit;
    const pageUsers = users.slice(offset, offset + limit);
    const hitScanCap = snapshot.size >= MAX_SCAN;

    return Response.json({
      success: true,
      data: {
        users: pageUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          scanCapped: hitScanCap,
        },
      },
    });
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return quotaExceededResponse();
    }
    console.error('Error in admin list users:', error);
    return Response.json(
      {
        success: false,
        error:
          error.message || 'An unexpected error occurred while listing users',
      },
      { status: 500 },
    );
  }
}
