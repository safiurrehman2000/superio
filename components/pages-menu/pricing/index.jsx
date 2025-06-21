import DefaulHeader2 from "@/components/header/DefaulHeader2";
import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import MobileMenu from "../../header/MobileMenu";

const index = () => {
  return (
    <>
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      <Breadcrumb title="Pricing" meta="Pricing" />
      {/* <!--End Page Title--> */}

      <section className="pricing-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Pricing Packages</h2>
            <div className="text">
              Lorem ipsum dolor sit amet elit, sed do eiusmod tempor.
            </div>
          </div>
        </div>
      </section>
      {/* <!-- End Pricing Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
