import dynamic from "next/dynamic";
import AppliedJobs from "@/components/dashboard-pages/candidates-dashboard/applied-jobs";

export const metadata = {
  title: "Gesolliciteerde Jobs | De Flexijobber - Mijn Sollicitaties",
  description:
    "Bekijk en beheer uw sollicitaties voor flexibele jobs in Vlaanderen via uw De Flexijobber kandidatendashboard.",
};

const index = () => {
  return (
    <>
      <AppliedJobs />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
