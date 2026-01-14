import { adminDb } from "@/utils/firebase-admin";
import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

async function getVacancies() {
  const snapshot = await adminDb
    .collection("jobs")
    .where("status", "==", "active")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export default async function sitemap() {
  const jobs = await getVacancies();

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/job-list`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
    },
    {
      url: `${siteUrl}/contact`,
    },
    {
      url: `${siteUrl}/faq`,
    },
    {
      url: `${siteUrl}/pricing`,
    },
    {
      url: `${siteUrl}/blog`,
    },
  ];

  const jobRoutes = jobs.map(job => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt || job.createdAt),
    changeFrequency: "daily",
    priority: 0.95,
  }));

  return [...staticRoutes, ...jobRoutes];
}

