import dynamic from "next/dynamic";
import About from "@/components/pages-menu/about";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Over Ons | De Flexijobber - Flexibele Jobs Platform",
  description:
    "Leer meer over De Flexijobber, het toonaangevende platform voor flexibele jobs in Vlaanderen. Ontdek onze missie en hoe wij werkgevers en flexwerkers met elkaar verbinden.",
  openGraph: {
    title: "Over Ons | De Flexijobber - Flexibele Jobs Platform",
    description:
      "Leer meer over De Flexijobber, het toonaangevende platform voor flexibele jobs in Vlaanderen. Ontdek onze missie en hoe wij werkgevers en flexwerkers met elkaar verbinden.",
    url: `${siteUrl}/about`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Over Ons | De Flexijobber - Flexibele Jobs Platform",
    description:
      "Leer meer over De Flexijobber, het toonaangevende platform voor flexibele jobs in Vlaanderen. Ontdek onze missie en hoe wij werkgevers en flexwerkers met elkaar verbinden.",
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Over De Flexijobber",
  description:
    "Het toonaangevende platform voor flexibele jobs in Vlaanderen. Verbindt werkgevers met flexwerkers in verschillende sectoren.",
  url: `${siteUrl}/about`,
  mainEntity: {
    "@type": "Organization",
    name: "De Flexijobber",
    url: siteUrl,
    description:
      "De Flexijobber is een platform dat werkgevers en flexwerkers met elkaar verbindt in Vlaanderen. We bieden flexibele jobs voor studenten, flexwerkers en mensen die bij willen verdienen.",
  },
};

const index = () => {
  return (
    <>
      <StructuredData data={aboutPageSchema} />
      <About />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
