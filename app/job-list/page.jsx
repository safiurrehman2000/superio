import dynamic from "next/dynamic";
import JobList from "@/components/job-listing-pages/job-list-v6";

export const metadata = {
  title:
    "Vacatures Zoeken | De Flexijobber - Vind Flexibele Jobs in Vlaanderen",
  description:
    "Ontdek flexibele job vacatures in verschillende sectoren in Vlaanderen. Zoek en solliciteer op duizenden flexibele banen bij De Flexijobber.",
};

const index = () => {
  return (
    <>
      <JobList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
