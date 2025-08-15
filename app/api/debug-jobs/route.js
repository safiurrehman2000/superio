import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase-admin";

export async function GET() {
  try {
    console.log("🔍 Debug: Checking jobs in database...");

    // Get all jobs
    const jobsRef = adminDb.collection("jobs");
    const snapshot = await jobsRef.get();

    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 Total jobs found: ${jobs.length}`);

    // Get recent jobs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJobs = jobs.filter((job) => {
      const jobDate = job.createdAt ? new Date(job.createdAt) : new Date(0);
      return jobDate >= thirtyDaysAgo;
    });

    // Get active jobs
    const activeJobs = jobs.filter((job) => job.status === "active");

    // Get jobs with React in title
    const reactJobs = jobs.filter(
      (job) => job.title && job.title.toLowerCase().includes("react")
    );

    const result = {
      totalJobs: jobs.length,
      recentJobs: recentJobs.length,
      activeJobs: activeJobs.length,
      reactJobs: reactJobs.length,
      sampleJobs: jobs.slice(0, 5).map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        location: job.location,
        tags: job.tags,
      })),
      recentSampleJobs: recentJobs.slice(0, 5).map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        location: job.location,
        tags: job.tags,
      })),
      reactSampleJobs: reactJobs.map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        location: job.location,
        tags: job.tags,
      })),
    };

    console.log("🔍 Debug result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Error in debug-jobs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
