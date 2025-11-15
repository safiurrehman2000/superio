const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin-dashboard/",
          "/candidates-dashboard/",
          "/employers-dashboard/",
          "/create-profile-candidate/",
          "/create-profile-employer/",
          "/onboard-",
          "/shop/",
          "/test-",
          "/error/",
          "/success/",
          "/not-found",
          "/404/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
