// lib/server/getJobByIdServer.js
import 'server-only';
import { db } from '@/lib/firebaseAdmin';

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

export async function getJobByIdServer(id) {
  if (!id) return null;

  const snap = await db.collection('jobs').doc(id).get();

  if (!snap.exists) return null;

  const data = snap.data();
  const raw = { id: snap.id, ...data };

  const job = {};
  for (const key of Object.keys(raw)) {
    job[key] = toSerializable(raw[key]);
  }
  return job;
}
