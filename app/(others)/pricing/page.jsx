import dynamic from "next/dynamic";

import Pricing from "@/components/pages-menu/pricing";

export const metadata = {
  title: "Prijzen | De Flexijobber - Pakketten voor Werkgevers",
  description:
    "Ontdek onze betaalbare pakketten voor het plaatsen van vacatures. Kies het pakket dat bij uw bedrijf past en vind de beste flexwerkers in Vlaanderen.",
};

const index = () => {
  return (
    <>
      <Pricing />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
