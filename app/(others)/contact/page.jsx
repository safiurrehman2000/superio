import dynamic from "next/dynamic";
import Contact from "@/components/pages-menu/contact";
import StructuredData from "@/components/common/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Contact | De Flexijobber - Neem Contact Met Ons Op",
  description:
    "Heeft u vragen of opmerkingen? Neem contact op met het team van De Flexijobber. Wij helpen u graag verder met al uw vragen over flexibele jobs in Vlaanderen.",
  openGraph: {
    title: "Contact | De Flexijobber - Neem Contact Met Ons Op",
    description:
      "Heeft u vragen of opmerkingen? Neem contact op met het team van De Flexijobber. Wij helpen u graag verder met al uw vragen over flexibele jobs in Vlaanderen.",
    url: `${siteUrl}/contact`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact | De Flexijobber - Neem Contact Met Ons Op",
    description:
      "Heeft u vragen of opmerkingen? Neem contact op met het team van De Flexijobber. Wij helpen u graag verder met al uw vragen over flexibele jobs in Vlaanderen.",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact De Flexijobber",
  description:
    "Neem contact op met het team van De Flexijobber voor vragen over flexibele jobs in Vlaanderen",
  url: `${siteUrl}/contact`,
};

const index = () => {
  return (
    <>
      <StructuredData data={contactPageSchema} />
      <Contact />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
