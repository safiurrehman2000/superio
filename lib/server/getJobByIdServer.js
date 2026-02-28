// lib/server/getJobByIdServer.js
import "server-only";
import { db } from "@/lib/firebaseAdmin";

export async function getJobByIdServer(id) {
  if (!id) return null;

  const snap = await db.collection("jobs").doc(id).get();

  if (!snap.exists) return null;

  const data = snap.data();

  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
  };
}
