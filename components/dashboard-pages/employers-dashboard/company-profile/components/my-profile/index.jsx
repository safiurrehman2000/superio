import LogoUpload from "@/components/dashboard-pages/candidates-dashboard/my-profile/components/my-profile/LogoUpload";
import FormInfoBox from "./FormInfoBox";

const index = () => {
  return (
    <div className="widget-content">
      <LogoUpload />

      <FormInfoBox />
      {/* compnay info box */}
    </div>
  );
};

export default index;
