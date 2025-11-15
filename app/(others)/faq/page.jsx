import dynamic from "next/dynamic";
import Faq from "@/components/pages-menu/faq";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Veelgestelde Vragen | De Flexijobber - FAQ",
  description:
    "Vind antwoorden op veelgestelde vragen over flexibele jobs, vacatures plaatsen, solliciteren en meer bij De Flexijobber.",
  openGraph: {
    title: "Veelgestelde Vragen | De Flexijobber - FAQ",
    description:
      "Vind antwoorden op veelgestelde vragen over flexibele jobs, vacatures plaatsen, solliciteren en meer bij De Flexijobber.",
    url: `${siteUrl}/faq`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Veelgestelde Vragen | De Flexijobber - FAQ",
    description:
      "Vind antwoorden op veelgestelde vragen over flexibele jobs, vacatures plaatsen, solliciteren en meer bij De Flexijobber.",
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

// FAQ structured data - you can enhance this by fetching actual FAQs from your database
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat is De Flexijobber?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De Flexijobber is een platform dat werkgevers en flexwerkers met elkaar verbindt in Vlaanderen. We bieden flexibele jobs voor studenten, flexwerkers en mensen die bij willen verdienen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe kan ik solliciteren op een job?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Om te solliciteren op een job, moet u eerst een account aanmaken als kandidaat. Vervolgens kunt u door de beschikbare vacatures bladeren en direct solliciteren op jobs die u interesseren.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe kan ik als werkgever een vacature plaatsen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Als werkgever kunt u een account aanmaken en vervolgens een vacature plaatsen. U kunt kiezen uit verschillende pakketten om uw vacature te publiceren.",
      },
    },
  ],
};

const index = () => {
  return (
    <>
      <StructuredData data={faqSchema} />
      <Faq />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
