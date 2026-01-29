import dynamic from "next/dynamic";
import Cookies from "@/components/pages-menu/cookie-beleid";
import StructuredData from "@/components/common/StructuredData";

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

export const metadata = {
  title: "Cookiebeleid | De Flexijobber",
  description:
    "Lees hoe De Flexijobber cookies gebruikt om jouw ervaring te verbeteren en voorkeuren te onthouden.",
  openGraph: {
    title: "Cookiebeleid | De Flexijobber",
    description:
      "Lees hoe De Flexijobber cookies gebruikt om jouw ervaring te verbeteren en voorkeuren te onthouden.",
    url: `${siteUrl}/cookie-beleid`,
    siteName: "De Flexijobber",
    locale: "nl_BE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cookiebeleid | De Flexijobber",
    description:
      "Lees hoe De Flexijobber cookies gebruikt om jouw ervaring te verbeteren en voorkeuren te onthouden.",
  },
  alternates: {
    canonical: `${siteUrl}/cookie-beleid`,
  },
};

const cookiePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cookiebeleid De Flexijobber",
  description:
    "Het cookiebeleid van De Flexijobber. Informatie over functionele en analytische cookies.",
  url: `${siteUrl}/cookie-beleid`,
};

const CookiePage = () => {
  return (
    <>
      <StructuredData data={cookiePageSchema} />
      <Cookies />
    </>
  );
};

export default dynamic(() => Promise.resolve(CookiePage), { ssr: false });
