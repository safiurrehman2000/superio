import { adminDb } from "@/utils/firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";

/**
 * GET /api/admin/list-users
 * Lists users with pagination and filtering
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can list users
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of users per page (default: 10, max: 50)
 * - userType: Filter by user type (Candidate, Employer, Admin)
 * - search: Search by email or name
 * - status: Filter by subscription status
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
      `Admin ${adminUser.email} (${adminUser.uid}) requesting user list`
    );

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50); // Max 50 per page
    const userType = searchParams.get("userType");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = adminDb.collection("users");

    // Apply filters
    if (userType) {
      query = query.where("userType", "==", userType);
    }

    if (status) {
      query = query.where("subscriptionStatus", "==", status);
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const totalUsers = totalSnapshot.size;

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute query
    const snapshot = await query.get();

    // Process results
    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        userType: userData.userType,
        name: userData.name || "",
        company_name: userData.company_name || "",
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        subscriptionStatus: userData.subscriptionStatus || "none",
        planId: userData.planId || null,
        isFirstTime: userData.isFirstTime || false,
        hasPostedJob: userData.hasPostedJob || false,
        lastUpdatedBy: userData.lastUpdatedBy || null,
        lastUpdatedAt:
          userData.lastUpdatedAt?.toDate?.() || userData.lastUpdatedAt,
      });
    });

    // Apply search filter if provided
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          (user.company_name &&
            user.company_name.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(
      `✅ Admin ${adminUser.email} successfully retrieved ${filteredUsers.length} users`
    );

    return Response.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          userType,
          search,
          status,
        },
      },
    });
  } catch (error) {
    console.error("Error in admin list users:", error);
    return Response.json(
      {
        success: false,
        error:
          error.message || "An unexpected error occurred while listing users",
      },
      { status: 500 }
    );
  }
}
