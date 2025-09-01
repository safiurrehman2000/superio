import { adminDb } from "@/utils/firebase-admin";

/**
 * GET /api/faqs
 * Lists all FAQs (public endpoint)
 *
 * This endpoint is accessible to everyone and doesn't require authentication
 * It's used by the public FAQ page to display frequently asked questions
 */
export async function GET() {
  try {
    console.log("🔍 Fetching FAQs from Firestore...");

    // Get all FAQs from Firestore, ordered by creation date
    const faqsSnapshot = await adminDb
      .collection("faqs")
      .orderBy("createdAt", "desc")
      .get();

    console.log(`📊 Found ${faqsSnapshot.size} FAQs`);

    const faqs = [];
    faqsSnapshot.forEach((doc) => {
      faqs.push({
        id: doc.id,
        heading: doc.data().heading,
        content: doc.data().content,
        category: doc.data().category,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      });
    });

    console.log("✅ FAQs fetched successfully:", faqs.length);

    return Response.json({
      success: true,
      faqs: faqs,
      count: faqs.length,
    });
  } catch (error) {
    console.error("❌ Error fetching FAQs:", error);

    // Return a more detailed error response
    return Response.json(
      {
        success: false,
        error: "Failed to fetch FAQs",
        details: error.message,
        faqs: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
