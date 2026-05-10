/* eslint-disable no-console */
/**
 * Restores Firestore admin/content documents wiped during DB reset.
 * Source of truth: utils/constants.js (STATES, SECTORS, JOB_TYPE_OPTIONS)
 * and scripts/initialize-faqs.js (sample categories + FAQs).
 *
 * Usage: set -a && source .env && set +a && node scripts/restore-admin-content.cjs
 */
const admin = require("firebase-admin");

const OPTION_TYPES = {
  states: [
    { value: "antwerp", label: "Antwerpen" },
    { value: "limburg", label: "Limburg" },
    { value: "east-flanders", label: "Oost-Vlaanderen" },
    { value: "flemish-brabant", label: "Vlaams-Brabant" },
    { value: "west-flanders", label: "West-Vlaanderen" },
  ],
  sectors: [
    { value: "funeral-sector", label: "Uitvaartsector" },
    { value: "moving-sector", label: "Verhuissector" },
    { value: "power-supply", label: "Energievoorziening" },
    { value: "department-stores", label: "Warenhuizen" },
    { value: "independent-retail", label: "Zelfstandige detailhandel" },
    { value: "automotive-sector", label: "Autosector" },
    { value: "bakeries", label: "Bakkerijen" },
    { value: "cinemas", label: "Bioscopen" },
    { value: "buses-and-coaches", label: "Bussen en touringcars" },
    { value: "entertainment", label: "Entertainment" },
    { value: "event-sector", label: "Eventsector" },
    { value: "fashion-clothing", label: "Mode/Kledij" },
    { value: "food-products", label: "Handel in voedingsproducten" },
    { value: "hotel-sector", label: "Hotelsector" },
    { value: "real-estate-sector", label: "Vastgoedsector" },
    { value: "childcare", label: "Kinderopvang" },
    { value: "food-retail-trade", label: "Voedingsdetailhandel" },
    {
      value: "agriculture-and-horticulture",
      label: "Land- en tuinbouw",
    },
    {
      value: "medium-sized-food-companies",
      label: "Middelgrote voedingsbedrijven",
    },
    { value: "education", label: "Onderwijs" },
    { value: "driving-schools", label: "Rijscholen" },
    { value: "sport", label: "Sport" },
    {
      value: "sports-and-culture-in-the-flemish-community",
      label: "Sport en Cultuur in de Vlaamse Gemeenschap",
    },
  ],
  job_types: [
    { value: "flexijobber", label: "Flexijob" },
    { value: "retired_people", label: "Flexijob gepensioneerden" },
    { value: "student_job", label: "Studentenjob" },
    { value: "english_speaking_job", label: "English speaking job" },
  ],
};

const FAQ_SAMPLE_CATEGORIES = [
  { name: "General" },
  { name: "Account & Profile" },
  { name: "Job Posting" },
  { name: "Applications" },
  { name: "Payments & Billing" },
  { name: "Technical Support" },
];

const FAQ_SAMPLES = [
  {
    heading: "How do I create an account?",
    content:
      "To create an account, click on the 'Register' button in the top right corner. Fill in your email, password, and select whether you're a job seeker or employer. Verify your email address to complete the registration process.",
    categoryName: "General",
  },
  {
    heading: "How do I post a job?",
    content:
      "As an employer, you can post jobs by going to your dashboard and clicking 'Post New Job'. Fill in the job details including title, description, requirements, and location. Choose your pricing plan and submit for review.",
    categoryName: "Job Posting",
  },
  {
    heading: "How do I apply for a job?",
    content:
      "Browse available jobs and click on any job that interests you. Click the 'Apply Now' button, upload your resume, and fill in any additional required information. Submit your application and track its status in your dashboard.",
    categoryName: "Applications",
  },
  {
    heading: "How do I update my profile?",
    content:
      "Go to your dashboard and click on 'My Profile'. You can update your personal information, work experience, education, and skills. Don't forget to save your changes after making updates.",
    categoryName: "Account & Profile",
  },
  {
    heading: "What payment methods do you accept?",
    content:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe. You can also set up automatic billing for subscription plans.",
    categoryName: "Payments & Billing",
  },
  {
    heading: "How do I reset my password?",
    content:
      "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Click the link in your email to create a new password. Make sure to use a strong, unique password.",
    categoryName: "Account & Profile",
  },
  {
    heading: "How long does job approval take?",
    content:
      "Job postings are typically reviewed within 24-48 hours during business days. We review for content quality, compliance with our guidelines, and accuracy. You'll receive an email notification once your job is approved or if any changes are needed.",
    categoryName: "Job Posting",
  },
  {
    heading: "Can I edit a job after posting?",
    content:
      "Yes, you can edit your job postings. Go to your dashboard, find the job you want to edit, and click 'Edit'. Make your changes and submit. The updated job will go through a quick review process before going live again.",
    categoryName: "Job Posting",
  },
  {
    heading: "How do I contact support?",
    content:
      "You can contact our support team through the contact form on your website, or email support directly. We typically respond within 24 hours.",
    categoryName: "Technical Support",
  },
  {
    heading: "What happens if my subscription expires?",
    content:
      "When your subscription expires, your job postings will be paused and you won't be able to post new jobs. You can renew your subscription at any time to reactivate your account and continue posting jobs.",
    categoryName: "Payments & Billing",
  },
];

function getRequiredEnv(name, fallbackName) {
  const value =
    process.env[name] || (fallbackName ? process.env[fallbackName] : "");
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}${fallbackName ? ` (or ${fallbackName})` : ""}`
    );
  }
  return value;
}

function normalizePrivateKey(rawKey) {
  let privateKey = rawKey;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  return privateKey.replace(/\\n/g, "\n");
}

async function restoreOptions(db) {
  const batch = db.batch();
  for (const [docId, items] of Object.entries(OPTION_TYPES)) {
    const ref = db.collection("options").doc(docId);
    batch.set(ref, { items }, { merge: false });
  }
  await batch.commit();
  console.log(
    `Restored options: ${Object.keys(OPTION_TYPES).join(", ")} (${Object.values(OPTION_TYPES).reduce((n, a) => n + a.length, 0)} items total)`
  );
}

async function seedFaqsIfEmpty(db) {
  const categoriesSnap = await db.collection("categories").limit(1).get();
  const faqsSnap = await db.collection("faqs").limit(1).get();

  if (!categoriesSnap.empty || !faqsSnap.empty) {
    console.log(
      "Skipping FAQ/category seed: collections already have data (merge manually if needed)."
    );
    return;
  }

  const now = admin.firestore.Timestamp.now();
  const meta = {
    createdAt: now,
    updatedAt: now,
    createdBy: "restore-admin-content",
    createdByEmail: "restore-admin-content@system",
    lastUpdatedBy: "restore-admin-content",
    lastUpdatedAt: now,
  };

  const categoryIds = {};
  const batch = db.batch();

  for (const cat of FAQ_SAMPLE_CATEGORIES) {
    const ref = db.collection("categories").doc();
    batch.set(ref, { name: cat.name, ...meta });
    categoryIds[cat.name] = ref.id;
  }

  await batch.commit();

  let faqCount = 0;
  for (const faq of FAQ_SAMPLES) {
    const categoryId = categoryIds[faq.categoryName];
    if (!categoryId) continue;
    await db.collection("faqs").add({
      heading: faq.heading,
      content: faq.content,
      category: categoryId,
      ...meta,
    });
    faqCount++;
  }

  console.log(
    `Seeded ${FAQ_SAMPLE_CATEGORIES.length} FAQ categories and ${faqCount} FAQs.`
  );
}

async function main() {
  const projectId = getRequiredEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "FIREBASE_PROJECT_ID"
  );
  const clientEmail = getRequiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(getRequiredEnv("FIREBASE_PRIVATE_KEY"));

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  const db = admin.firestore();

  await restoreOptions(db);
  await seedFaqsIfEmpty(db);

  console.log("Done.");
}

main()
  .then(async () => {
    await admin.app().delete();
  })
  .catch(async (err) => {
    console.error(err);
    if (admin.apps.length) await admin.app().delete();
    process.exitCode = 1;
  });
