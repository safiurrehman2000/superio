// app/job-list/page.jsx

const siteUrl = "https://www.de-flexi-jobber.be";

export const metadata = {
  title: "Vacatures zoeken | De Flexi Jobber",
  description:
    "Ontdek flexibele job vacatures in Vlaanderen. Zoek en solliciteer eenvoudig via De Flexi Jobber.",
  alternates: {
    canonical: `${siteUrl}/job-list`,
  },
  openGraph: {
    title: "Vacatures zoeken | De Flexi Jobber",
    description:
      "Ontdek flexibele job vacatures in Vlaanderen. Zoek en solliciteer eenvoudig.",
    url: `${siteUrl}/job-list`,
    siteName: "De Flexi Jobber",
    locale: "nl_BE",
    type: "website",
  },
};

export default function JobListPage() {
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Flexibele jobs in Vlaanderen",
    description:
      "Overzicht van beschikbare flexibele jobs in Vlaanderen",
    url: `${siteUrl}/job-list`,
  };

  return (
    <>
      {/* Structured data SERVER-side */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />

      {/* Client component */}
      <JobList />
    </>
  );
}

/* IMPORTS ONDERAAN (duidelijker) */
import JobList from "@/components/job-listing-pages/job-list-v6";
