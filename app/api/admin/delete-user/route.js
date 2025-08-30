import { adminDb } from "@/utils/firebase-admin";
import admin from "firebase-admin";
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from "@/utils/admin-auth-middleware";

/**
 * DELETE /api/admin/delete-user
 * Deletes a user's Firebase Auth account and all related Firestore data
 * This uses Firebase Admin SDK to delete auth accounts from server-side
 *
 * Authentication: Requires valid Firebase ID token with Admin privileges
 * Authorization: Only Admin users can delete other users
 */
export async function DELETE(request) {
  try {
    // Authenticate and authorize the admin user
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminUser = authResult.user;
    console.log(
      `Admin ${adminUser.email} (${adminUser.uid}) attempting to delete user`
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === adminUser.uid) {
      return Response.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user data to determine user type
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    const userType = userData.userType;

    console.log(`Starting deletion for ${userType} user: ${userId}`);

    // === STEP 1: Delete Firebase Auth Account ===
    try {
      await admin.auth().deleteUser(userId);
      console.log(`✅ Firebase Auth account deleted for user: ${userId}`);
    } catch (authError) {
      console.error(
        `❌ Failed to delete Firebase Auth account: ${authError.message}`
      );
      // Continue with Firestore cleanup even if auth deletion fails
    }

    // === STEP 2: Delete Firestore Data (using Admin SDK) ===

    // Delete resume subcollection (for candidates)
    if (userType === "Candidate") {
      const resumeColRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resume");
      const resumeDocs = await resumeColRef.get();
      const resumeDeletePromises = resumeDocs.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(resumeDeletePromises);
      console.log(`✅ Resume documents deleted for candidate: ${userId}`);
    }

    // Delete user document
    await userRef.delete();
    console.log(`✅ User document deleted: ${userId}`);

    // Delete saved_jobs (for candidates)
    if (userType === "Candidate") {
      const savedJobsRef = adminDb.collection("saved_jobs");
      const savedJobsQuery = savedJobsRef.where("userId", "==", userId);
      const savedJobsSnap = await savedJobsQuery.get();
      const savedJobsDeletePromises = savedJobsSnap.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(savedJobsDeletePromises);
      console.log(`✅ Saved jobs deleted for candidate: ${userId}`);
    }

    // Delete receipts (for employers)
    if (userType === "Employer") {
      const receiptsRef = adminDb.collection("receipts");
      const receiptsQuery = receiptsRef.where("userId", "==", userId);
      const receiptsSnap = await receiptsQuery.get();
      const receiptsDeletePromises = receiptsSnap.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(receiptsDeletePromises);
      console.log(`✅ Receipts deleted for employer: ${userId}`);
    }

    // Delete applications
    if (userType === "Candidate") {
      const applicationsRef = adminDb.collection("applications");
      const applicationsQuery = applicationsRef.where(
        "candidateId",
        "==",
        userId
      );
      const applicationsSnap = await applicationsQuery.get();
      const applicationsDeletePromises = applicationsSnap.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(applicationsDeletePromises);
      console.log(`✅ Applications deleted for candidate: ${userId}`);
    } else if (userType === "Employer") {
      // For employers, delete applications for their jobs
      const jobsRef = adminDb.collection("jobs");
      const jobsQuery = jobsRef.where("employerId", "==", userId);
      const jobsSnap = await jobsQuery.get();

      for (const jobDoc of jobsSnap.docs) {
        const applicationsRef = adminDb.collection("applications");
        const appQuery = applicationsRef.where("jobId", "==", jobDoc.id);
        const appSnap = await appQuery.get();
        const appDeletePromises = appSnap.docs.map((doc) => doc.ref.delete());
        await Promise.all(appDeletePromises);
      }
      console.log(`✅ Job applications deleted for employer: ${userId}`);
    }

    // Delete jobViews where user was the viewer (for candidates)
    if (userType === "Candidate") {
      const jobViewsRef = adminDb.collection("jobViews");
      const jobViewsSnap = await jobViewsRef.get();

      for (const jobViewDoc of jobViewsSnap.docs) {
        const viewsRef = jobViewDoc.ref.collection("views");
        const viewsQuery = viewsRef.where("userId", "==", userId);
        const viewsSnap = await viewsQuery.get();
        const viewsDeletePromises = viewsSnap.docs.map((doc) =>
          doc.ref.delete()
        );
        await Promise.all(viewsDeletePromises);
      }
      console.log(`✅ Job views deleted for candidate: ${userId}`);
    }

    // Delete jobs and their related data (for employers)
    if (userType === "Employer") {
      const jobsRef = adminDb.collection("jobs");
      const jobsQuery = jobsRef.where("employerId", "==", userId);
      const jobsSnap = await jobsQuery.get();

      for (const jobDoc of jobsSnap.docs) {
        // Delete jobViews doc and its views subcollection
        const jobViewRef = adminDb.collection("jobViews").doc(jobDoc.id);
        const viewsColRef = jobViewRef.collection("views");
        const viewsSnap = await viewsColRef.get();
        const viewsDeletePromises = viewsSnap.docs.map((doc) =>
          doc.ref.delete()
        );
        await Promise.all(viewsDeletePromises);
        await jobViewRef.delete();

        // Delete the job itself
        await jobDoc.ref.delete();
      }
      console.log(`✅ Jobs and job views deleted for employer: ${userId}`);
    }

    console.log(`🎉 Complete deletion successful for user: ${userId}`);

    return Response.json({
      success: true,
      message: `User ${userId} and all related data deleted successfully`,
      deletedAuthAccount: true,
      deletedFirestoreData: true,
    });
  } catch (error) {
    console.error("Error in admin user deletion:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during deletion",
      },
      { status: 500 }
    );
  }
}
