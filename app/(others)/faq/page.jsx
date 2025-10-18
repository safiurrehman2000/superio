import dynamic from "next/dynamic";

import Faq from "@/components/pages-menu/faq";

export const metadata = {
  title: "Veelgestelde Vragen | De Flexijobber - FAQ",
  description:
    "Vind antwoorden op veelgestelde vragen over flexibele jobs, vacatures plaatsen, solliciteren en meer bij De Flexijobber.",
};

const index = () => {
  return (
    <>
      <Faq />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
