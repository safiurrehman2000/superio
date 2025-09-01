import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { adminDb } from "@/utils/firebase-admin";
import { sanitizeFormData } from "@/utils/sanitization";

/**
 * GET /api/admin/categories
 * Lists all categories
 *
 * POST /api/admin/categories
 * Creates a new category
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can manage categories
 */
export async function GET(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) fetching categories`
    );

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
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        createdBy: doc.data().createdBy,
        createdByEmail: doc.data().createdByEmail,
      });
    });

    return Response.json({
      success: true,
      message: "Categories fetched successfully",
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

export async function POST(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to create new category`
    );

    const { name } = await request.json();

    // Validate required fields
    if (!name || !name.trim()) {
      return Response.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Basic sanitization - remove HTML tags and trim
    const sanitizedName = name.trim().replace(/<[^>]*>/g, "");

    if (!sanitizedName) {
      return Response.json(
        {
          success: false,
          error: "Category name cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    // Add metadata
    const categoryData = {
      name: sanitizedName,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminUser.uid,
      createdByEmail: adminUser.email,
      lastUpdatedBy: adminUser.uid,
      lastUpdatedAt: new Date(),
    };

    // Create category document in Firestore
    const categoryRef = await adminDb
      .collection("categories")
      .add(categoryData);

    console.log(
      `✅ Admin ${adminUser.email} successfully created category: ${name}`
    );

    // Create audit log entry
    try {
      const auditData = {
        action: "create_category",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetId: categoryRef.id,
        targetType: "Category",
        timestamp: new Date(),
        details: {
          name: sanitizedName || name.trim() || "Unknown",
        },
      };

      // Validate audit data before saving
      if (
        auditData.details.name &&
        auditData.adminUserId &&
        auditData.targetId
      ) {
        await adminDb.collection("adminAuditLogs").add(auditData);
      } else {
        console.warn("Skipping audit log due to invalid data:", auditData);
      }
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "Category created successfully",
      category: {
        id: categoryRef.id,
        ...categoryData,
        createdAt: categoryData.createdAt?.toDate?.() || categoryData.createdAt,
        updatedAt: categoryData.updatedAt?.toDate?.() || categoryData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error while creating category",
      },
      { status: 500 }
    );
  }
}
