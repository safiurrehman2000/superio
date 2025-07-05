import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = admin.firestore();

export async function POST(request) {
  try {
    // Check for the secret header to ensure this is a legitimate request
    const initSecret = request.headers.get("x-init-secret");
    const expectedSecret = process.env.NEXT_PUBLIC_INIT_SECRET;

    if (!initSecret || initSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const defaultPackages = [
      {
        packageType: "Basic",
        price: "Free",
        tag: "",
        features: [
          "30 job posting",
          "3 featured job",
          "Job displayed for 15 days",
          "Premium Support 24/7",
        ],
        isActive: true,
        sortOrder: 1,
      },
      {
        packageType: "Standard",
        price: "499",
        tag: "tagged",
        features: [
          "40 job posting",
          "5 featured job",
          "Job displayed for 20 days",
          "Premium Support 24/7",
        ],
        isActive: true,
        sortOrder: 2,
      },
      {
        packageType: "Extended",
        price: "799",
        tag: "",
        features: [
          "50 job posting",
          "10 featured job",
          "Job displayed for 60 days",
          "Premium Support 24/7",
        ],
        isActive: true,
        sortOrder: 3,
      },
    ];

    const packagesRef = adminDb.collection("pricingPackages");

    // Check if packages already exist
    const existingPackages = await packagesRef.get();
    if (!existingPackages.empty) {
      return NextResponse.json(
        { success: false, error: "Pricing packages already exist" },
        { status: 400 }
      );
    }

    // Create packages
    const batch = adminDb.batch();

    for (const packageData of defaultPackages) {
      const newPackageRef = packagesRef.doc();
      batch.set(newPackageRef, {
        ...packageData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error initializing pricing packages:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
