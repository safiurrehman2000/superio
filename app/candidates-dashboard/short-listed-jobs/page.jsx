import dynamic from "next/dynamic";
import ShortListedJobs from "@/components/dashboard-pages/candidates-dashboard/short-listed-jobs";

export const metadata = {
  title: "Bewaarde Jobs | De Flexijobber - Mijn Opgeslagen Vacatures",
  description:
    "Bekijk uw bewaarde jobs en opgeslagen vacatures via uw De Flexijobber kandidatendashboard.",
};

const index = () => {
  return (
    <>
      <ShortListedJobs />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
