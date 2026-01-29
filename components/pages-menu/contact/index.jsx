import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import ContactForm from "./ContactForm";
import Address from "./Address";
import Breadcrumb from "../../common/Breadcrumb";
import FounderCard from "./FounderCard"; // 🟢 Voeg je Tibor component toe

const index = () => {
  return (
    <>
      <LoginPopup />
      <DefaulHeader />
      <MobileMenu />
      <Breadcrumb title="Contact" meta="Contact" />

      <section className="contact-section">
        <div className="auto-container">
          {/* ===============================
              COVER IMAGE + TEKST
          ================================ */}
          <div className="contact-cover">
            <img
              src="/images/contact-images.jpg"
              alt="Neem contact op"
              className="cover-image"
            />
            <div className="contact-cover-overlay">
              <h2>Neem contact met ons op</h2>
              <p>
                Ben je werkgever en wil je meer informatie over adverteren?  
                Heb je als flexi-jobber gewoon een vraag? Dat begrijpen we.
                Neem contact met ons op om te zien wat we voor elkaar kunnen betekenen.
              </p>
            </div>
          </div>

          {/* ===============================
              CONTACT ICONS
          ================================ */}
          <div className="row justify-content-center contact-address">
            <Address />
          </div>

          <div className="row align-items-center mt-5">
            {/* CONTACT FORM */}
            <div className="col-lg-6 col-md-12">
              <div className="contact-form default-form">
                <h3>Neem contact op</h3>
                <ContactForm />
              </div>
            </div>

            {/* FOUNDER FOTO */}
            <div className="col-lg-6 col-md-12 d-flex justify-content-center mt-4 mt-lg-0">
              <FounderCard />
            </div>
          </div>
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default index;
