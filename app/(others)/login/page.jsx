import dynamic from "next/dynamic";

import LogIn from "@/components/pages-menu/login";

export const metadata = {
  title: "Inloggen | De Flexijobber - Flexibele Jobs in Vlaanderen",
  description:
    "Log in op De Flexijobber en ontdek flexibele job mogelijkheden of beheer uw vacatures in verschillende sectoren in Vlaanderen.",
};

const index = () => {
  return (
    <>
      <LogIn />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
