import '@/utils/firebase-admin';
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';

/**
 * @param {unknown} created Firestore Timestamp, Date, ms, or ISO string
 * @returns {Date}
 */
export function receiptCreatedToDate(created) {
  if (!created) return new Date();
  if (created instanceof Date) return created;
  if (typeof created === 'object' && typeof created.toDate === 'function') {
    return created.toDate();
  }
  if (typeof created === 'object' && typeof created.seconds === 'number') {
    return new Date(created.seconds * 1000);
  }
  if (typeof created === 'number') {
    return new Date(created < 1e12 ? created * 1000 : created);
  }
  if (typeof created === 'string') {
    const d = new Date(created);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * @param {import('firebase-admin/firestore').Transaction} tx
 * @param {unknown} createdDate
 * @returns {Promise<{ year: number, sequence: number, receiptNumber: string }>}
 */
export async function allocateReceiptNumberInTransaction(tx, createdDate) {
  const date = receiptCreatedToDate(createdDate);
  const year = date.getFullYear();
  const seqRef = adminDb.collection('receiptSequences').doc(String(year));
  const seqSnap = await tx.get(seqRef);
  const last = seqSnap.exists ? Number(seqSnap.data()?.lastSequence || 0) : 0;
  const sequence = last + 1;

  tx.set(
    seqRef,
    {
      lastSequence: sequence,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    year,
    sequence,
    receiptNumber: `${year}/${sequence}`,
  };
}

/**
 * Next receipt number for the calendar year of `createdDate`: `2026/1`, `2026/2`, …
 * Prefer {@link createReceiptWithAllocatedNumber} so numbers are not consumed when
 * receipt creation is skipped or fails.
 *
 * @param {Date} [createdDate]
 * @returns {Promise<{ year: number, sequence: number, receiptNumber: string }>}
 */
export async function allocateReceiptNumber(createdDate = new Date()) {
  return adminDb.runTransaction(async (tx) =>
    allocateReceiptNumberInTransaction(tx, createdDate),
  );
}

/**
 * Allocate the next receipt number and create the receipt doc in one transaction.
 * If the doc already exists, no new number is consumed.
 *
 * @param {string} receiptDocId
 * @param {Record<string, unknown>} receiptFields fields without `receiptNumber`
 * @param {unknown} createdDate
 * @returns {Promise<{ created: boolean, receiptNumber: string | null }>}
 */
export async function createReceiptWithAllocatedNumber(
  receiptDocId,
  receiptFields,
  createdDate,
) {
  const docRef = adminDb.collection('receipts').doc(receiptDocId);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (snap.exists) {
      return {
        created: false,
        receiptNumber: snap.data()?.receiptNumber ?? null,
      };
    }

    const { receiptNumber } = await allocateReceiptNumberInTransaction(
      tx,
      createdDate,
    );

    tx.create(docRef, {
      ...receiptFields,
      receiptNumber,
    });

    return { created: true, receiptNumber };
  });
}

/** @param {string} receiptNumber e.g. `2026/3` */
export function formatReceiptInvoiceTitle(receiptNumber) {
  return `FACTUUR ${receiptNumber}`;
}

/** @param {string} receiptNumber */
export function receiptPdfFilename(receiptNumber) {
  const safe = String(receiptNumber).replace(/\//g, '-');
  return `factuur-${safe}.pdf`;
}

/**
 * Assign `receiptNumber` on an existing receipt doc if missing (legacy rows / on-demand PDF).
 *
 * @param {string} receiptDocId
 * @returns {Promise<string>}
 */
export async function ensureReceiptNumberOnDocument(receiptDocId) {
  const docRef = adminDb.collection('receipts').doc(receiptDocId);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists) {
      throw new Error('Receipt not found');
    }
    const data = snap.data();
    if (data.receiptNumber) {
      return data.receiptNumber;
    }

    const { receiptNumber } = await allocateReceiptNumberInTransaction(
      tx,
      receiptCreatedToDate(data.created),
    );
    tx.update(docRef, { receiptNumber });
    return receiptNumber;
  });
}
