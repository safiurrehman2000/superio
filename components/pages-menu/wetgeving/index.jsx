import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import Breadcrumb from "../../common/Breadcrumb";
import Image from "next/image";
import WetgevingContent from "./WetgevingContent";

const index = () => {
  return (
    <>
      {/* <!-- Header Span --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      <Breadcrumb title="Wetgeving" meta="Wetgeving" />
      {/* <!--End Page Title--> */}

      <section className="tnc-section">
        <div className="auto-container">
          {/* End sec-title */}
          <WetgevingContent />
        </div>
      </section>
      {/* <!-- End TNC Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
