/**
 * Load a pricing package by the plan id stored on the user/receipt
 * (Firestore doc id or legacy numeric `id` field).
 */
export async function getPricingPackageByPlanId(adminDb, planId) {
  if (planId == null || planId === '') return null;

  const planKey = String(planId);
  const byDoc = await adminDb.collection('pricingPackages').doc(planKey).get();
  if (byDoc.exists) {
    return { docId: byDoc.id, ...byDoc.data() };
  }

  const byField = await adminDb
    .collection('pricingPackages')
    .where('id', '==', planId)
    .limit(1)
    .get();

  if (!byField.empty) {
    const doc = byField.docs[0];
    return { docId: doc.id, ...doc.data() };
  }

  if (typeof planId === 'string' && /^\d+$/.test(planId)) {
    const asNumber = parseInt(planId, 10);
    const byNumeric = await adminDb
      .collection('pricingPackages')
      .where('id', '==', asNumber)
      .limit(1)
      .get();
    if (!byNumeric.empty) {
      const doc = byNumeric.docs[0];
      return { docId: doc.id, ...doc.data() };
    }
  }

  return null;
}
