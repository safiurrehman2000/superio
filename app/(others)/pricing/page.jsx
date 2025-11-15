import dynamic from "next/dynamic";
import Pricing from "@/components/pages-menu/pricing";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Prijzen | De Flexijobber - Pakketten voor Werkgevers",
  description:
    "Ontdek onze betaalbare pakketten voor het plaatsen van vacatures. Kies het pakket dat bij uw bedrijf past en vind de beste flexwerkers in Vlaanderen.",
  openGraph: {
    title: "Prijzen | De Flexijobber - Pakketten voor Werkgevers",
    description:
      "Ontdek onze betaalbare pakketten voor het plaatsen van vacatures. Kies het pakket dat bij uw bedrijf past en vind de beste flexwerkers in Vlaanderen.",
    url: `${siteUrl}/pricing`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Prijzen | De Flexijobber - Pakketten voor Werkgevers",
    description:
      "Ontdek onze betaalbare pakketten voor het plaatsen van vacatures. Kies het pakket dat bij uw bedrijf past en vind de beste flexwerkers in Vlaanderen.",
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

const index = () => {
  return (
    <>
      <Pricing />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
