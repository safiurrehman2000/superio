import dynamic from "next/dynamic";
import JobList from "@/components/job-listing-pages/job-list-v6";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title:
    "Vacatures Zoeken | De Flexijobber - Vind Flexibele Jobs in Vlaanderen",
  description:
    "Ontdek flexibele job vacatures in verschillende sectoren in Vlaanderen. Zoek en solliciteer op duizenden flexibele banen bij De Flexijobber.",
  openGraph: {
    title:
      "Vacatures Zoeken | De Flexijobber - Vind Flexibele Jobs in Vlaanderen",
    description:
      "Ontdek flexibele job vacatures in verschillende sectoren in Vlaanderen. Zoek en solliciteer op duizenden flexibele banen bij De Flexijobber.",
    url: `${siteUrl}/job-list`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/resource/logo.png`,
        width: 1200,
        height: 630,
        alt: "De Flexijobber - Vacatures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Vacatures Zoeken | De Flexijobber - Vind Flexibele Jobs in Vlaanderen",
    description:
      "Ontdek flexibele job vacatures in verschillende sectoren in Vlaanderen. Zoek en solliciteer op duizenden flexibele banen bij De Flexijobber.",
    images: [`${siteUrl}/images/resource/logo.png`],
  },
  alternates: {
    canonical: `${siteUrl}/job-list`,
  },
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Flexibele Jobs in Vlaanderen",
  description:
    "Zoek en vind flexibele jobs in verschillende sectoren in Vlaanderen",
  url: `${siteUrl}/job-list`,
  mainEntity: {
    "@type": "ItemList",
    name: "Flexibele Jobs",
    description: "Lijst van beschikbare flexibele jobs in Vlaanderen",
  },
};

const index = () => {
  return (
    <>
      <StructuredData data={collectionPageSchema} />
      <JobList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
