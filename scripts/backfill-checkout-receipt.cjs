/* eslint-disable no-console */
/**
 * Backfill missing checkout receipts for an employer.
 *
 * Usage:
 *   set -a && source .env && set +a && node scripts/backfill-checkout-receipt.cjs info@bistro-louis.be
 */
const admin = require("firebase-admin");
const Stripe = require("stripe");

function initFirebase() {
  if (admin.apps.length) return admin.firestore();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return admin.firestore();
}

function isCheckoutSessionPaymentComplete(session) {
  if (!session || session.status !== "complete") return false;
  return (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  );
}

function userAccessCreatedAt(userData) {
  const raw =
    userData?.oneTimePurchaseAt ??
    userData?.subscriptionStartDate ??
    userData?.subscriptionUpdatedAt;
  if (!raw) return new Date();
  if (typeof raw.toDate === "function") return raw.toDate();
  if (raw._seconds) return new Date(raw._seconds * 1000);
  return new Date(raw);
}

async function createReceiptWithAllocatedNumber(db, receiptDocId, receiptFields, createdDate) {
  const docRef = db.collection("receipts").doc(receiptDocId);
  const year = createdDate.getFullYear();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (snap.exists) {
      return {
        created: false,
        receiptNumber: snap.data()?.receiptNumber ?? null,
      };
    }

    const seqRef = db.collection("receiptSequences").doc(String(year));
    const seqSnap = await tx.get(seqRef);
    const last = seqSnap.exists ? Number(seqSnap.data()?.lastSequence || 0) : 0;
    const sequence = last + 1;
    const receiptNumber = `${year}/${sequence}`;

    tx.set(
      seqRef,
      {
        lastSequence: sequence,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.create(docRef, {
      ...receiptFields,
      receiptNumber,
    });

    return { created: true, receiptNumber };
  });
}

async function resolveUserId(db, email) {
  const snap = await db
    .collection("users")
    .where("email", "==", email.trim())
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function backfillCheckoutReceiptsForUser(stripe, db, userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return { created: 0, skipped: 0, reason: "user_not_found" };

  const customerId = userDoc.data().stripeCustomerId;
  if (!customerId) return { created: 0, skipped: 0, reason: "no_stripe_customer" };

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 100,
  });

  let created = 0;
  let skipped = 0;

  for (const session of sessions.data) {
    if (session.mode !== "payment" || !isCheckoutSessionPaymentComplete(session)) {
      skipped += 1;
      continue;
    }
    const receiptRef = db.collection("receipts").doc(session.id);
    const before = await receiptRef.get();
    if (before.exists) {
      skipped += 1;
      continue;
    }

    const legacyDup = await db
      .collection("receipts")
      .where("checkoutSessionId", "==", session.id)
      .limit(1)
      .get();
    if (!legacyDup.empty) {
      skipped += 1;
      continue;
    }

    const planId = session.metadata?.planId || null;
    const amount = session.amount_total ?? 0;
    const currency = session.currency || "eur";
    const createdAt = session.created
      ? new Date(session.created * 1000)
      : new Date();
    const createResult = await createReceiptWithAllocatedNumber(
      db,
      session.id,
      {
        userId,
        planId,
        amount,
        currency,
        receipt_pdf_url: null,
        stripe_invoice_pdf_url: null,
        created: createdAt,
        checkoutSessionId: session.id,
        type: "one_time",
        source: "admin_backfill",
      },
      createdAt,
    );

    if (createResult.created) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  return { created, skipped };
}

async function createMissingOneTimeReceiptFromUserAccess(db, userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return { ok: false, reason: "user_not_found" };

  const userData = userDoc.data();
  const planId = userData.planId || null;
  if (!planId) return { ok: false, reason: "no_plan" };

  const existing = await db
    .collection("receipts")
    .where("userId", "==", userId)
    .where("planId", "==", planId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return {
      ok: true,
      reason: "already_exists",
      receiptId: existing.docs[0].id,
      receiptNumber: existing.docs[0].data().receiptNumber,
    };
  }

  const pkgDoc = await db.collection("pricingPackages").doc(planId).get();
  const pkgData = pkgDoc.exists ? pkgDoc.data() : {};
  const priceEuro = Number(pkgData.price ?? 0);
  const amount = Number.isFinite(priceEuro) ? Math.round(priceEuro * 100) : 0;
  const currency = pkgData.currency || "eur";
  const created = userAccessCreatedAt(userData);
  const receiptDocId = `access_${userId}_${planId}`;
  const createResult = await createReceiptWithAllocatedNumber(
    db,
    receiptDocId,
    {
      userId,
      planId,
      amount,
      currency,
      receipt_pdf_url: null,
      stripe_invoice_pdf_url: null,
      created,
      checkoutSessionId: null,
      type: "one_time",
      source: "admin_backfill",
    },
    created,
  );

  if (!createResult.created) {
    return {
      ok: true,
      reason: "already_exists",
      receiptId: receiptDocId,
      receiptNumber: createResult.receiptNumber,
    };
  }

  return {
    ok: true,
    reason: "created",
    receiptId: receiptDocId,
    receiptNumber: createResult.receiptNumber,
  };
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/backfill-checkout-receipt.cjs <email>");
    process.exit(1);
  }

  const db = initFirebase();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const userId = await resolveUserId(db, email);
  if (!userId) {
    console.error("User not found for email:", email);
    process.exit(1);
  }

  console.log("Backfilling receipts for", email, `(${userId})`);

  const stripeResult = await backfillCheckoutReceiptsForUser(stripe, db, userId);
  console.log("Stripe session backfill:", stripeResult);

  const accessResult = await createMissingOneTimeReceiptFromUserAccess(db, userId);
  console.log("Access backfill:", accessResult);

  const receipts = await db
    .collection("receipts")
    .where("userId", "==", userId)
    .get();
  console.log("Total receipts for user:", receipts.size);
  receipts.forEach((doc) => {
    const data = doc.data();
    console.log("-", doc.id, data.receiptNumber, data.amount, data.source || "");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
