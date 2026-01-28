const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://deflexijobber.be";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/api/",
          "/admin-dashboard/",
          "/candidates-dashboard/",
          "/employers-dashboard/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
