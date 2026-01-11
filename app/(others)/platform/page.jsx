import dynamic from "next/dynamic";
import Platform from "@/components/pages-menu/platform/platform-page.jsx";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "De Flexijobber Platform | Voor Werkgevers",
  description:
    "Ontdek het De Flexijobber platform voor werkgevers. Plaats gratis vacatures, bereik meer kandidaten en beheer alles eenvoudig via één dashboard.",
  openGraph: {
    title: "De Flexijobber Platform | Voor Werkgevers",
    description:
      "Plaats gratis vacatures, bereik kandidaten via Google Jobs en social media, en beheer alles via het De Flexijobber platform.",
    url: `${siteUrl}/platform`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "De Flexijobber Platform | Voor Werkgevers",
    description:
      "Het platform voor werkgevers om eenvoudig flexi-jobs te publiceren en kandidaten te bereiken.",
  },
  alternates: {
    canonical: `${siteUrl}/platform`,
  },
};

const platformPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "De Flexijobber Platform",
  description:
    "Het platform voor werkgevers om flexi-job vacatures te plaatsen en kandidaten te bereiken.",
  url: `${siteUrl}/platform`,
  mainEntity: {
    "@type": "Organization",
    name: "De Flexijobber",
    url: siteUrl,
    description:
      "De Flexijobber ondersteunt werkgevers bij het plaatsen van flexi-job vacatures en het bereiken van geschikte kandidaten.",
  },
};

const PlatformPage = () => {
  return (
    <>
      <StructuredData data={platformPageSchema} />
      <Platform />
    </>
  );
};

export default dynamic(() => Promise.resolve(PlatformPage), {
  ssr: false,
});

