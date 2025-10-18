import dynamic from "next/dynamic";

import Contact from "@/components/pages-menu/contact";

export const metadata = {
  title: "Contact | De Flexijobber - Neem Contact Met Ons Op",
  description:
    "Heeft u vragen of opmerkingen? Neem contact op met het team van De Flexijobber. Wij helpen u graag verder met al uw vragen over flexibele jobs in Vlaanderen.",
};

const index = () => {
  return (
    <>
      <Contact />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
