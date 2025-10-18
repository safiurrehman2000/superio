import dynamic from "next/dynamic";
import ChangePassword from "@/components/dashboard-pages/employers-dashboard/change-password";

export const metadata = {
  title: "Wachtwoord Wijzigen | De Flexijobber - Account Beveiliging",
  description:
    "Wijzig uw wachtwoord voor uw De Flexijobber werkgeversaccount voor optimale beveiliging van uw bedrijfsprofiel.",
};

const index = () => {
  return (
    <>
      <ChangePassword />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
