import dynamic from "next/dynamic";
import CompanyProfile from "@/components/dashboard-pages/employers-dashboard/company-profile";

export const metadata = {
  title: "Bedrijfsprofiel | De Flexijobber - Mijn Bedrijf",
  description:
    "Beheer uw bedrijfsprofiel en informatie voor potentiële kandidaten via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <CompanyProfile />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
