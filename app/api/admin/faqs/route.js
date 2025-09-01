import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";
import { sanitizeFormData } from "@/utils/sanitization";

/**
 * GET /api/admin/faqs
 * Lists all FAQs
 *
 * POST /api/admin/faqs
 * Creates a new FAQ
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can manage FAQs
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
      `Admin ${adminUser.email} (${adminUser.uid}) requesting FAQ list`
    );

    // Get all FAQs from Firestore
    const faqsSnapshot = await adminDb
      .collection("faqs")
      .orderBy("createdAt", "desc")
      .get();

    const faqs = [];
    faqsSnapshot.forEach((doc) => {
      faqs.push({
        id: doc.id,
        heading: doc.data().heading,
        content: doc.data().content,
        category: doc.data().category,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        createdBy: doc.data().createdBy,
        createdByEmail: doc.data().createdByEmail,
        lastUpdatedBy: doc.data().lastUpdatedBy,
        lastUpdatedAt:
          doc.data().lastUpdatedAt?.toDate?.() || doc.data().lastUpdatedAt,
      });
    });

    return Response.json({
      success: true,
      faqs: faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return Response.json(
      { success: false, error: "Internal server error while fetching FAQs" },
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
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to create new FAQ`
    );

    const { heading, content, category } = await request.json();

    // Validate required fields
    if (!heading || !heading.trim()) {
      return Response.json(
        { success: false, error: "FAQ heading is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return Response.json(
        { success: false, error: "FAQ content is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { success: false, error: "FAQ category is required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryRef = adminDb.collection("categories").doc(category);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      return Response.json(
        { success: false, error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    // Basic sanitization - remove HTML tags and trim
    const sanitizedHeading = heading.trim().replace(/<[^>]*>/g, "");
    const sanitizedContent = content.trim().replace(/<[^>]*>/g, "");

    if (!sanitizedHeading) {
      return Response.json(
        {
          success: false,
          error: "FAQ heading cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    if (!sanitizedContent) {
      return Response.json(
        {
          success: false,
          error: "FAQ content cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    // Add metadata
    const faqData = {
      heading: sanitizedHeading,
      content: sanitizedContent,
      category: category,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminUser.uid,
      createdByEmail: adminUser.email,
      lastUpdatedBy: adminUser.uid,
      lastUpdatedAt: new Date(),
    };

    // Create FAQ document in Firestore
    const faqRef = await adminDb.collection("faqs").add(faqData);

    console.log(
      `✅ Admin ${adminUser.email} successfully created FAQ: ${heading}`
    );

    // Create audit log entry
    try {
      await adminDb.collection("adminAuditLogs").add({
        action: "create_faq",
        adminUserId: adminUser.uid,
        adminUserEmail: adminUser.email,
        targetId: faqRef.id,
        targetType: "FAQ",
        timestamp: new Date(),
        details: {
          heading: sanitizedData.heading || "",
          contentLength: sanitizedData.content
            ? sanitizedData.content.length
            : 0,
        },
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Don't fail the operation if audit logging fails
    }

    return Response.json({
      success: true,
      message: "FAQ created successfully",
      faq: {
        id: faqRef.id,
        ...faqData,
        createdAt: faqData.createdAt?.toDate?.() || faqData.createdAt,
        updatedAt: faqData.updatedAt?.toDate?.() || faqData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return Response.json(
      { success: false, error: "Internal server error while creating FAQ" },
      { status: 500 }
    );
  }
}
