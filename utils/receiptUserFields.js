import { adminDb } from '@/utils/firebase-admin';

export async function getUserFieldsForReceipt(userId) {
  if (!userId) {
    return { userEmail: null, userCompanyName: null };
  }

  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { userEmail: null, userCompanyName: null };
  }

  const userData = userDoc.data();
  return {
    userEmail: userData.email || null,
    userCompanyName: userData.company_name || null,
  };
}
