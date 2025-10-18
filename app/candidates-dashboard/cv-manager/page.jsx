import dynamic from "next/dynamic";
import CvManager from "@/components/dashboard-pages/candidates-dashboard/cv-manager";

export const metadata = {
  title: "CV Beheer | De Flexijobber - Beheer Uw CV's",
  description:
    "Beheer en upload uw CV's voor flexibele jobs in Vlaanderen via uw De Flexijobber kandidatendashboard.",
};

const index = () => {
  return (
    <>
      <CvManager />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
