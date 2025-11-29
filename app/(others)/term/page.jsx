import dynamic from "next/dynamic";
import Wetgeving from "@/components/pages-menu/wetgeving";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Wetgeving | De Flexijobber - Flexibele Jobs Platform",
  description:
    "Informatie over relevante wetgeving voor flexibele arbeid, arbeidsrecht en gegevensbescherming op De Flexijobber platform.",
  openGraph: {
    title: "Wetgeving | De Flexijobber - Flexibele Jobs Platform",
    description:
      "Informatie over relevante wetgeving voor flexibele arbeid, arbeidsrecht en gegevensbescherming op De Flexijobber platform.",
    url: `${siteUrl}/term`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Wetgeving | De Flexijobber - Flexibele Jobs Platform",
    description:
      "Informatie over relevante wetgeving voor flexibele arbeid, arbeidsrecht en gegevensbescherming op De Flexijobber platform.",
  },
  alternates: {
    canonical: `${siteUrl}/term`,
  },
};

const wetgevingPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Wetgeving",
  description:
    "Informatie over relevante wetgeving voor flexibele arbeid, arbeidsrecht en gegevensbescherming.",
  url: `${siteUrl}/term`,
};

const index = () => {
  return (
    <>
      <StructuredData data={wetgevingPageSchema} />
      <Wetgeving />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
