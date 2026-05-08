function toIsoOrDefault(value, defaultDate) {
  if (value == null || value === "") {
    return defaultDate.toISOString();
  }
  if (typeof value.toDate === "function") {
    const d = value.toDate();
    return Number.isNaN(d.getTime()) ? defaultDate.toISOString() : d.toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? defaultDate.toISOString()
      : value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? defaultDate.toISOString() : d.toISOString();
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? defaultDate.toISOString() : d.toISOString();
  }
  if (typeof value === "object") {
    const sec = value.seconds ?? value._seconds;
    const nano = value.nanoseconds ?? value._nanoseconds ?? 0;
    if (typeof sec === "number" && Number.isFinite(sec)) {
      const d = new Date(sec * 1000 + nano / 1e6);
      return Number.isNaN(d.getTime()) ? defaultDate.toISOString() : d.toISOString();
    }
  }
  return defaultDate.toISOString();
}

export default function JobStructuredData({ job }) {
  const now = new Date();
  const defaultValidThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description?.replace(/<[^>]*>/g, ""),
    datePosted: toIsoOrDefault(job.createdAt, now),
    validThrough: toIsoOrDefault(job.validThrough, defaultValidThrough),

    employmentType: (() => {
      const jt = job.jobType ?? job.JobType;
      if (Array.isArray(jt)) return jt[0] ?? "PART_TIME";
      return jt ?? "PART_TIME";
    })(),

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
