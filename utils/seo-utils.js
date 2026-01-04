const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

/**
 * Generate organization structured data
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "De Flexijobber",
    url: siteUrl,
    logo: `${siteUrl}/images/resource/logo.png`,
    description:
      "Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren.",
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Dutch", "French"],
    },
    areaServed: {
      "@type": "Country",
      name: "Belgium",
    },
  };
};

/**
 * Generate job posting structured data
 */
export const generateJobPostingSchema = (job) => {
  if (!job) return null;

  const jobUrl = `${siteUrl}/job-list/${job.id}`;

  const descriptionParts = [];
  if (job.description) descriptionParts.push(job.description);
  if (job.functionDescription) {
    descriptionParts.push(`Functieomschrijving: ${job.functionDescription}`);
  }
  if (job.profileSkills) {
    descriptionParts.push(`Profiel/vaardigheden: ${job.profileSkills}`);
  }
  if (job.offer) {
    descriptionParts.push(`Aanbod: ${job.offer}`);
  }
  if (job.schedule) {
    descriptionParts.push(`Uurrooster: ${job.schedule}`);
  }
  const fullDescription = descriptionParts.join("\n\n");

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title || "Flexibele Job",
    description: fullDescription || job.description || "",
    identifier: {
      "@type": "PropertyValue",
      name: "De Flexijobber",
      value: job.id,
    },
    datePosted: job.createdAt
      ? new Date(job.createdAt).toISOString()
      : new Date().toISOString(),
    validThrough: job.expiryDate
      ? new Date(job.expiryDate).toISOString()
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: mapJobTypeToSchema(job.jobType),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Werkgever",
      sameAs: job.link || siteUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Vlaanderen",
        addressRegion: "Vlaanderen",
        addressCountry: "BE",
      },
    },
    url: jobUrl,
  };

  if (job.salary) {
    baseSchema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        value: job.salary,
      },
    };
  }

  return baseSchema;
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

/**
 * Map job type to schema.org employment type
 */
const mapJobTypeToSchema = (jobType) => {
  if (!jobType) return "FULL_TIME";

  const type = jobType.toLowerCase();
  if (type.includes("part") || type.includes("deeltijd")) {
    return "PART_TIME";
  }
  if (type.includes("full") || type.includes("voltijd")) {
    return "FULL_TIME";
  }
  if (type.includes("contract") || type.includes("contract")) {
    return "CONTRACTOR";
  }
  if (type.includes("temp") || type.includes("tijdelijk")) {
    return "TEMPORARY";
  }
  return "PART_TIME";
};

/**
 * Generate metadata for a page
 */
export const generatePageMetadata = (options = {}) => {
  const {
    title,
    description,
    image,
    url,
    type = "website",
    noindex = false,
  } = options;

  const metadata = {
    title: title
      ? `${title} | De Flexijobber`
      : "De Flexijobber - Flexibele Jobs Platform in Vlaanderen",
    description:
      description ||
      "De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen.",
    openGraph: {
      title: title || "De Flexijobber - Flexibele Jobs Platform in Vlaanderen",
      description:
        description ||
        "De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen.",
      url: url || siteUrl,
      siteName: "De Flexijobber",
      locale: "nl_BE",
      type: type,
      images: [
        {
          url: image || `${siteUrl}/images/resource/logo.png`,
          width: 1200,
          height: 630,
          alt: title || "De Flexijobber",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || "De Flexijobber - Flexibele Jobs Platform in Vlaanderen",
      description:
        description ||
        "De Flexijobber - Het toonaangevende platform voor flexibele jobs in Vlaanderen.",
      images: [image || `${siteUrl}/images/resource/logo.png`],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    alternates: {
      canonical: url || siteUrl,
    },
  };

  return metadata;
};
