import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import Breadcrumb from "../../common/Breadcrumb";
import PlatformContent from "./Platform";

const PlatformPage = () => {
  return (
    <>
      {/* Login Popup */}
      <LoginPopup />

      {/* Header */}
      <DefaulHeader />

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Breadcrumb */}
      <Breadcrumb title="Platform" meta="Werkgevers" />

      {/* Content section */}
      <section className="platform-page tnc-section">
        <div className="auto-container">
          <PlatformContent />
        </div>
      </section>

      {/* Footer */}
      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default PlatformPage;
