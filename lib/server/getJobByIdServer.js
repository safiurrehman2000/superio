// lib/server/getJobByIdServer.js
import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/firebaseAdmin';
import { isFirestoreQuotaError } from '@/utils/firestore-errors';

function toSerializable(value) {
  if (value == null) return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    const sec = value.seconds ?? value._seconds;
    const nano = value.nanoseconds ?? value._nanoseconds ?? 0;
    if (typeof sec === 'number' && Number.isFinite(sec)) {
      return new Date(sec * 1000 + nano / 1e6).toISOString();
    }
  }
  return value;
}

async function fetchJobById(id) {
  const snap = await db.collection('jobs').doc(id).get();

  if (!snap.exists) return null;

  const data = snap.data();
  const raw = { id: snap.id, ...data };

  const needsEmployerData =
    raw.employerId &&
    (!raw.company || !raw.companyName || !raw.logo || !raw.employerCompanyType);

  if (needsEmployerData) {
    try {
      const employerSnap = await db.collection('users').doc(raw.employerId).get();
      if (employerSnap.exists) {
        const employer = employerSnap.data();
        raw.company =
          raw.company || raw.companyName || employer.company_name || null;
        raw.companyName =
          raw.companyName || employer.company_name || raw.company || null;
        raw.logo = raw.logo || employer.logo || null;
        raw.employerCompanyType = employer.company_type || null;
      }
    } catch (error) {
      if (!isFirestoreQuotaError(error)) {
        console.warn('Failed to enrich job with employer data:', error);
      }
    }
  }

  const job = {};
  for (const key of Object.keys(raw)) {
    job[key] = toSerializable(raw[key]);
  }
  return job;
}

export const getJobByIdServer = cache(async (id) => {
  if (!id) return null;

  try {
    return await fetchJobById(id);
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return { id, __quotaError: true };
    }
    throw error;
  }
});
