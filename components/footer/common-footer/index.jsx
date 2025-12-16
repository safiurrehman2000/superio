import Image from "next/image";
import CopyrightFooter from "./CopyrightFooter";
import FooterContent from "./FooterContent";
import { LOGO } from "@/utils/constants";
import horecaBenelux from "../../../public/images/horeca-benelux.webp";

const index = ({ footerStyle = "" }) => {
  return (
    <footer className={`main-footer ${footerStyle}`}>
      <div className="auto-container">
        {/* <!--Widgets Section--> */}
        <div className="widgets-section" data-aos="fade-up">
          <div className="row">
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo">
                  <a href="#">
                    <Image
                      width={154}
                      height={50}
                      src={LOGO}
                      alt="De Flexijobber Logo"
                    />
                  </a>
                </div>
                <p className="phone-num">
                  <span>Bel Ons</span>
                  <a href="tel:+32491100143">+32 491 10 01 43</a>
                </p>
                <p className="address">
                  Belgiëlei 129, 2018 Antwerpen <br />
                  <a href="mailto:info@de-flexi-jobber.be" className="email">
                    info@de-flexi-jobber.be
                  </a>
                  <br />
                  BTW: BE 0655.845.308
                </p>
              </div>
            </div>
            {/* End footer left widget */}

            <div className="big-column col-xl-8 col-lg-9 col-md-12">
              <div className="row">
                <FooterContent />
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">
                      In samenwerking met Horeca Benelux
                    </h4>
                    <div className="widget-content">
                      <Image
                        width={200}
                        height={100}
                        src={horecaBenelux}
                        alt="Horeca Benelux"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End col-xl-8 */}
          </div>
        </div>
      </div>
      {/* End auto-container */}

      <CopyrightFooter />
      {/* <!--Bottom--> */}
    </footer>
    //   {/* <!-- End Main Footer --> */}
  );
};

export default index;
