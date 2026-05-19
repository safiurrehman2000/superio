/**
 * Shared Firestore profile shape for new / repaired users.
 */
export function buildUserProfile({
  email,
  userType,
  createdBy = 'self_registration',
  emailVerified = false,
}) {
  const now = new Date();
  return {
    email,
    userType,
    createdAt: now,
    isFirstTime: true,
    emailVerified,
    createdBy,
    lastUpdatedBy: createdBy,
    lastUpdatedAt: now,
  };
}

export function profileNeedsSetup(snap) {
  if (!snap?.exists) return true;
  const data = snap.data() || {};
  return !data.email || !data.userType;
}
