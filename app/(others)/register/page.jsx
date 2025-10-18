import dynamic from "next/dynamic";

import RegisterForm from "@/components/pages-menu/register";

export const metadata = {
  title: "Registreren | De Flexijobber - Maak een Account aan",
  description:
    "Registreer bij De Flexijobber als flexwerker of werkgever en ontdek flexibele job mogelijkheden in Vlaanderen.",
};

const index = () => {
  return (
    <>
      <RegisterForm />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
