import dynamic from "next/dynamic";
import AlgemeneVoorwaarden from "@/components/pages-menu/algemene-voorwaarden";
import StructuredData from "@/components/common/StructuredData";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Algemene Voorwaarden | De Flexijobber",
  description:
    "Lees de algemene voorwaarden van De Flexijobber met betrekking tot het gebruik van het platform en de aangeboden diensten.",
  openGraph: {
    title: "Algemene Voorwaarden | De Flexijobber",
    description:
      "Lees de algemene voorwaarden van De Flexijobber met betrekking tot het gebruik van het platform en de aangeboden diensten.",
    url: `${siteUrl}/algemene-voorwaarden`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Algemene Voorwaarden | De Flexijobber",
    description:
      "Lees de algemene voorwaarden van De Flexijobber met betrekking tot het gebruik van het platform.",
  },
  alternates: {
    canonical: `${siteUrl}/algemene-voorwaarden`,
  },
};

const algemeneVoorwaardenSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Algemene Voorwaarden De Flexijobber",
  description:
    "De algemene voorwaarden van De Flexijobber met informatie over rechten, plichten en gebruik van het platform.",
  url: `${siteUrl}/algemene-voorwaarden`,
};

const AlgemeneVoorwaardenPage = () => {
  return (
    <>
      <StructuredData data={algemeneVoorwaardenSchema} />
      <AlgemeneVoorwaarden />
    </>
  );
};

export default dynamic(
  () => Promise.resolve(AlgemeneVoorwaardenPage),
  { ssr: false }
);
