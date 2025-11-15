import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-1";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "De Flexijobber - Online vacaturesite voor flexwerkers in Vlaanderen",
  description:
    "De Flexijobber is een platform voor werkgevers en flexwerkers in Vlaanderen die op zoek zijn naar flexibele jobs in verschillende sectoren.",
  openGraph: {
    title:
      "De Flexijobber - Online vacaturesite voor flexwerkers in Vlaanderen",
    description:
      "De Flexijobber is een platform voor werkgevers en flexwerkers in Vlaanderen die op zoek zijn naar flexibele jobs in verschillende sectoren.",
    url: siteUrl,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/resource/logo.png`,
        width: 1200,
        height: 630,
        alt: "De Flexijobber",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "De Flexijobber - Online vacaturesite voor flexwerkers in Vlaanderen",
    description:
      "De Flexijobber is een platform voor werkgevers en flexwerkers in Vlaanderen die op zoek zijn naar flexibele jobs in verschillende sectoren.",
    images: [`${siteUrl}/images/resource/logo.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "De Flexijobber",
  url: siteUrl,
  logo: `${siteUrl}/images/resource/logo.png`,
  description:
    "Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren.",
  sameAs: [
    // Add social media links when available
    // "https://www.facebook.com/flexijobber",
    // "https://www.linkedin.com/company/flexijobber",
    // "https://twitter.com/flexijobber",
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

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "De Flexijobber",
  url: siteUrl,
  description: "Het toonaangevende platform voor flexibele jobs in Vlaanderen",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/job-list?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Flexibele Jobs in Vlaanderen",
  description:
    "Zoek en vind flexibele jobs in verschillende sectoren in Vlaanderen. Perfect voor studenten, flexwerkers en mensen die bij willen verdienen.",
  identifier: {
    "@type": "PropertyValue",
    name: "De Flexijobber",
    value: "flexijobber-jobs",
  },
  datePosted: new Date().toISOString(),
  validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  employmentType: ["PART_TIME", "TEMPORARY", "CONTRACTOR"],
  hiringOrganization: {
    "@type": "Organization",
    name: "De Flexijobber",
    sameAs: siteUrl,
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Vlaanderen",
      addressCountry: "BE",
    },
  },
  baseSalary: {
    "@type": "MonetaryAmount",
    currency: "EUR",
  },
};

export default function page() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={jobPostingSchema} />
      <Wrapper>
        <Home />
      </Wrapper>
    </>
  );
}
