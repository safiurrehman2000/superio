import dynamic from "next/dynamic";
import Packages from "@/components/dashboard-pages/employers-dashboard/packages";

export const metadata = {
  title: "Pakketten | De Flexijobber - Vacature Pakketten",
  description:
    "Bekijk en beheer uw vacature pakketten en abonnementen via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <Packages />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
