import dynamic from "next/dynamic";
import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";

export const metadata = {
  title: "Job Plaatsen | De Flexijobber - Nieuwe Vacature Plaatsen",
  description:
    "Plaats een nieuwe vacature voor flexibele jobs in Vlaanderen en vind de ideale kandidaten via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <PostJob />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
