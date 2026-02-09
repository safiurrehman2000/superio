export default function JobStructuredData({ job }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",

    title: job.title,
    description: job.description,

    datePosted: job.createdAt?.toDate
      ? job.createdAt.toDate().toISOString()
      : new Date().toISOString(),

    validThrough: job.validThrough
      ? new Date(job.validThrough).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),

    employmentType: ["PART_TIME", "TEMPORARY"],

    identifier: {
      "@type": "PropertyValue",
      name: "De Flexijobber",
      value: job.id,
    },

    directApply: true,

    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      logo:
        job.companyLogo ||
        "https://www.deflexijobber.be/images/resource/logo.png",
      sameAs: job.link,
    },

    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "BE",
      },
    },

    applicantLocationRequirements: {
      "@type": "Country",
      name: "Belgium",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
