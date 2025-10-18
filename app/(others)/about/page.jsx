import dynamic from "next/dynamic";

import About from "@/components/pages-menu/about";

export const metadata = {
  title: "Over Ons | De Flexijobber - Flexibele Jobs Platform",
  description:
    "Leer meer over De Flexijobber, het toonaangevende platform voor flexibele jobs in Vlaanderen. Ontdek onze missie en hoe wij werkgevers en flexwerkers met elkaar verbinden.",
};

const index = () => {
  return (
    <>
      <About />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
