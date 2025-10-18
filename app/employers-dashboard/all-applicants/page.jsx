import dynamic from "next/dynamic";
import AllApplicants from "@/components/dashboard-pages/employers-dashboard/all-applicants";

export const metadata = {
  title: "Alle Sollicitanten | De Flexijobber - Beheer Sollicitaties",
  description:
    "Bekijk en beheer alle sollicitanten voor uw flexibele vacatures via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <AllApplicants />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
