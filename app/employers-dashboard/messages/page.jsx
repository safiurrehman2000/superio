import dynamic from "next/dynamic";
import Messages from "@/components/dashboard-pages/employers-dashboard/messages";

export const metadata = {
  title: "Berichten | De Flexijobber - Communicatie met Kandidaten",
  description:
    "Beheer uw berichten en communiceer met potentiële kandidaten via uw De Flexijobber werkgeversdashboard.",
};

const index = () => {
  return (
    <>
      <Messages />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
