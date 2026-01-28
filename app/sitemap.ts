import { adminDb } from "@/utils/firebase-admin";
import { MetadataRoute } from "next";
import { Timestamp } from "firebase-admin/firestore";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://deflexijobber.be";

/* ✅ Type voor je vacatures */
type Job = {
  id: string;
  slug?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
};

async function getVacancies(): Promise<Job[]> {
  const snapshot = await adminDb
    .collection("jobs")
    .where("status", "==", "active")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Job, "id">),
  }));
}

/* ✅ Timestamp → Date helper */
function toDate(value?: Timestamp | Date): Date {
  if (!value) return new Date();
  return value instanceof Timestamp ? value.toDate() : value;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getVacancies();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/job-list`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/faq` },
    { url: `${siteUrl}/pricing` },
    { url: `${siteUrl}/blog` },
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs
  .filter(job => typeof job.slug === "string" && job.slug.length > 0)
  .map(job => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: toDate(job.updatedAt ?? job.createdAt),
    changeFrequency: "daily",
    priority: 0.95,
  }));

  return [...staticRoutes, ...jobRoutes];
}
