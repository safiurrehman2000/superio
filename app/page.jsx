import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-1";
import StructuredData from "@/components/common/StructuredData";
import TestVacanciesPopup from "@/components/common/TestVacanciesPopup";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.deflexijobber.be";

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

/**
 * Organization schema — correct voor homepage
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "De Flexijobber",
  url: siteUrl,
  logo: `${siteUrl}/images/resource/logo.png`,
  description:
    "Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren.",
  areaServed: {
    "@type": "Country",
    name: "Belgium",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    availableLanguage: ["Dutch", "French"],
  },
};

/**
 * WebSite schema — correct + SearchAction
 */
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

export default function Page() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <TestVacanciesPopup />

      <Wrapper>
        <Home />
      </Wrapper>
    </>
  );
}
