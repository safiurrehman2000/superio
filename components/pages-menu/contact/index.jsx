import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import ContactForm from "./ContactForm";
import Address from "./Address";
import Breadcrumb from "../../common/Breadcrumb";

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
      
      <Breadcrumb title="Contact" meta="Contact" />
      {/* <!--End Page Title--> */}
      <section className="contact-section">
        <div className="auto-container">

          {/* Address blok */}
          <div className="row justify-content-center contact-address">
            <Address />
          </div>

          {/* Contact Form */}
          <div className="contact-form default-form">
            <h3>Neem contact op</h3>
            <ContactForm />
          </div>

        </div>
      </section>
      {/* <!-- Contact Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
