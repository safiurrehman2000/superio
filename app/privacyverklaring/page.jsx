import dynamic from "next/dynamic";
import Privacyverklaring from "@/components/pages-menu/privacyverklaring";
import StructuredData from "@/components/common/StructuredData";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Privacyverklaring | De Flexijobber",
  description:
    "Lees hoe De Flexijobber omgaat met jouw persoonsgegevens en privacy bij het gebruik van ons platform.",
  openGraph: {
    title: "Privacyverklaring | De Flexijobber",
    description:
      "Lees hoe De Flexijobber omgaat met jouw persoonsgegevens en privacy bij het gebruik van ons platform.",
    url: `${siteUrl}/privacyverklaring`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacyverklaring | De Flexijobber",
    description:
      "Ontdek hoe De Flexijobber jouw persoonsgegevens beschermt en verwerkt.",
  },
  alternates: {
    canonical: `${siteUrl}/privacyverklaring`,
  },
};

const privacyverklaringSchema = {
  "@context": "https://schema.org",
  "@type": "PrivacyPolicy",
  name: "Privacyverklaring De Flexijobber",
  description:
    "De privacyverklaring van De Flexijobber met informatie over gegevensverwerking en privacybescherming.",
  url: `${siteUrl}/privacyverklaring`,
};

const PrivacyverklaringPage = () => {
  return (
    <>
      <StructuredData data={privacyverklaringSchema} />
      <Privacyverklaring />
    </>
  );
};

export default dynamic(
  () => Promise.resolve(PrivacyverklaringPage),
  { ssr: false }
);
