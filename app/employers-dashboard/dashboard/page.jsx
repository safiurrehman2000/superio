import dynamic from "next/dynamic";
import DashboadHome from "@/components/dashboard-pages/employers-dashboard/dashboard";

export const metadata = {
  title: "Werkgever Dashboard | De Flexijobber - Beheer Vacatures",
  description:
    "Beheer uw vacatures en bekijk sollicitanten voor flexibele jobs in Vlaanderen via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <DashboadHome />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
