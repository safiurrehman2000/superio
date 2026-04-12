import "@/utils/firebase-admin";
import { randomUUID } from "crypto";
import admin from "firebase-admin";

/**
 * Uploads a PDF to Firebase Storage and returns a long-lived download URL (Firebase token style).
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.invoiceId
 * @param {Buffer} params.pdfBuffer
 * @returns {Promise<string>}
 */
export async function uploadBrandedReceiptPdf({ userId, invoiceId, pdfBuffer }) {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set");
  }

  const bucket = admin.storage().bucket(bucketName);
  const safeInvoiceId = String(invoiceId).replace(/[^\w.-]/g, "_");
  const objectPath = `receipts/${userId}/${safeInvoiceId}.pdf`;
  const token = randomUUID();
  const file = bucket.file(objectPath);

  await file.save(pdfBuffer, {
    resumable: false,
    metadata: {
      contentType: "application/pdf",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`;
}
