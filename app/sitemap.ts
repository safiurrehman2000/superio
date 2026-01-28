export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";

// ✅ Firebase init (server-safe)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const SITE_URL = "https://deflexijobber.be";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 🔹 Statische pagina’s
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/job-list`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/contact` },
    { url: `${SITE_URL}/faq` },
    { url: `${SITE_URL}/pricing` },
    { url: `${SITE_URL}/blog` },
  ];

  // 🔹 Jobs uit Firestore
  const jobsSnapshot = await getDocs(collection(db, "jobs"));

  const jobPages: MetadataRoute.Sitemap = jobsSnapshot.docs.map((doc) => {
    const data = doc.data();

    const lastModified =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date();

    return {
      url: `${SITE_URL}/job-list/${doc.id}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  return [...staticPages, ...jobPages];
}
