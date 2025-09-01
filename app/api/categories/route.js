import { adminDb } from "@/utils/firebase-admin";

/**
 * GET /api/categories
 * Lists all categories for public access
 */
export async function GET() {
  try {
    // Get all categories from Firestore, ordered by name
    const categoriesSnapshot = await adminDb
      .collection("categories")
      .orderBy("name", "asc")
      .get();

    const categories = [];
    categoriesSnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        name: doc.data().name,
      });
    });

    return Response.json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while fetching categories",
      },
      { status: 500 }
    );
  }
}
