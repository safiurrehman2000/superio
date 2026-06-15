import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

/**
 * Fetch Firestore documents by id in chunks (max 10 per `in` query).
 */
export async function batchFetchDocsByIds(db, collectionName, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const result = {};

  for (let i = 0; i < uniqueIds.length; i += 10) {
    const chunk = uniqueIds.slice(i, i + 10);
    const q = query(
      collection(db, collectionName),
      where(documentId(), 'in', chunk),
    );
    const snap = await getDocs(q);
    snap.docs.forEach((docSnap) => {
      result[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
    });
  }

  return result;
}
