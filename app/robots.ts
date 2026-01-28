const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs/"],
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
