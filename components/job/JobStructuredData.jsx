export default function JobStructuredData({ job }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description?.replace(/<[^>]*>/g, ""),
    datePosted: new Date(job.createdAt).toISOString(),
    validThrough: job.validThrough
      ? new Date(job.validThrough).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),

    employmentType: job.jobType || "PART_TIME",

    identifier: {
      "@type": "PropertyValue",
      name: "De Flexi Jobber",
      value: job.id,
    },

    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "De Flexi Jobber",
      sameAs: job.link || "https://www.de-flexi-jobber.be",
      logo:
        job.companyLogo ||
        "https://www.de-flexi-jobber.be/images/logo-deflexijobber.png",
    },

    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.address && { streetAddress: job.address }),
        ...(job.postalCode && { postalCode: job.postalCode }),
        addressLocality: job.location,
        addressCountry: "BE",
      },
    },

    applicantLocationRequirements: {
      "@type": "Country",
      name: "Belgium",
    },

    directApply: true,
  };

  if (job.salary) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        value: job.salary,
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
