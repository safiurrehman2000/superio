import { adminDb } from "@/utils/firebase-admin";

/**
 * @param {string|null|undefined} planId
 * @returns {Promise<string|null>}
 */
export async function resolvePricingPackageLabel(planId) {
  if (!planId) return null;

  const byDoc = await adminDb.collection("pricingPackages").doc(planId).get();
  if (byDoc.exists) {
    const d = byDoc.data();
    return d.packageType || d.name || null;
  }

  const q = await adminDb
    .collection("pricingPackages")
    .where("id", "==", planId)
    .limit(1)
    .get();

  if (!q.empty) {
    const d = q.docs[0].data();
    return d.packageType || d.name || null;
  }

  return null;
}
