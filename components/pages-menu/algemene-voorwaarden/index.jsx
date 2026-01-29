import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import Breadcrumb from "../../common/Breadcrumb";
import IntroDescriptions from "./IntroDescriptions";

const Index = () => {
  return (
    <>
      <LoginPopup />
      <DefaulHeader />
      <MobileMenu />

      <Breadcrumb title="Algemene Voorwaarden" meta="Algemene Voorwaarden" />

      <section className="about-section-three">
        <div className="auto-container">
          <div className="contact-cover">
            <img
              src="/images/terms-cover.jpg"
              alt="Algemene Voorwaarden"
              className="cover-image"
            />
            <div className="contact-cover-overlay">
              <h2>Algemene Voorwaarden De Flexi-Jobber</h2>
            </div>
          </div>

          <IntroDescriptions />
        </div>
      </section>

      <FooterDefault />
    </>
  );
};

export default Index;
