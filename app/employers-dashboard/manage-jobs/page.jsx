import dynamic from "next/dynamic";
import ManageJobs from "@/components/dashboard-pages/employers-dashboard/manage-jobs";

export const metadata = {
  title: "Jobs Beheren | De Flexijobber - Vacatures Beheer",
  description:
    "Beheer en bewerk uw gepubliceerde vacatures voor flexibele jobs in Vlaanderen via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <ManageJobs />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
