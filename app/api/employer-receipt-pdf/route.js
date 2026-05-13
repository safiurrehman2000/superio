import { NextResponse } from "next/server";
import "@/utils/firebase-admin";
import admin from "firebase-admin";
import { adminDb } from "@/utils/firebase-admin";
import Stripe from "stripe";
import { buildBrandedReceiptPdfForInvoice } from "@/utils/buildBrandedReceiptPdfForInvoice";
import { buildBrandedReceiptPdfForOneTimeSession } from "@/utils/buildBrandedReceiptPdfForOneTimeSession";
import { uploadBrandedReceiptPdf } from "@/utils/uploadBrandedReceiptPdf";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/** PDFKit + fs must run in Node, not Edge. */
export const runtime = "nodejs";

/**
 * Authenticated download: always generates the De Flexijobber PDF from Stripe + Firestore.
 * Does not use Stripe’s hosted PDF (avoids wrong template + expired URLs).
 * Optionally caches the file in Firebase Storage for other uses.
 */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Authorization required" }, { status: 401 });
  }

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const receiptId = searchParams.get("receiptId");
  if (!receiptId) {
    return NextResponse.json({ error: "receiptId is required" }, { status: 400 });
  }

  const snap = await adminDb.collection("receipts").doc(receiptId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const data = snap.data();
  if (data.userId !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const checkoutSessionId = data.checkoutSessionId;
  const invoiceId = data.invoiceId;

  if (checkoutSessionId && !invoiceId) {
    const safeId = String(checkoutSessionId).replace(/[^\w.-]/g, "_");
    const filename = `factuur-${safeId}.pdf`;

    try {
      const sessionFull = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
        expand: ["customer", "customer.tax_ids"],
      });
      const branded = await buildBrandedReceiptPdfForOneTimeSession(
        sessionFull,
        data.planId,
        uid,
      );

      if (!branded || branded.length === 0) {
        throw new Error("Generated PDF buffer is empty");
      }

      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (bucketName) {
        try {
          await uploadBrandedReceiptPdf({
            userId: uid,
            invoiceId: `one-time-${checkoutSessionId}`,
            pdfBuffer: branded,
          });
        } catch (cacheErr) {
          console.error("employer-receipt-pdf: storage cache upload failed", cacheErr);
        }
      }

      return new NextResponse(new Uint8Array(branded), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      console.error("employer-receipt-pdf: one-time PDF failed", err);
      return NextResponse.json(
        {
          error:
            "De factuur-PDF kon niet worden gegenereerd. Probeer later opnieuw of neem contact op.",
          detail: process.env.NODE_ENV === "development" ? String(err?.message || err) : undefined,
        },
        { status: 502 },
      );
    }
  }

  if (!invoiceId) {
    return NextResponse.json({ error: "No invoice or checkout session on receipt" }, { status: 404 });
  }

  const safeInvoiceId = String(invoiceId).replace(/[^\w.-]/g, "_");
  const filename = `factuur-${safeInvoiceId}.pdf`;

  try {
    const inv = await stripe.invoices.retrieve(invoiceId);
    const branded = await buildBrandedReceiptPdfForInvoice(inv, data.planId, uid);

    if (!branded || branded.length === 0) {
      throw new Error("Generated PDF buffer is empty");
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (bucketName) {
      try {
        await uploadBrandedReceiptPdf({
          userId: uid,
          invoiceId,
          pdfBuffer: branded,
        });
      } catch (cacheErr) {
        console.error("employer-receipt-pdf: storage cache upload failed", cacheErr);
      }
    }

    return new NextResponse(new Uint8Array(branded), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("employer-receipt-pdf: branded PDF failed", err);
    return NextResponse.json(
      {
        error:
          "De factuur-PDF kon niet worden gegenereerd. Probeer later opnieuw of neem contact op.",
        detail: process.env.NODE_ENV === "development" ? String(err?.message || err) : undefined,
      },
      { status: 502 }
    );
  }
}
