import Image from "next/image";
import CopyrightFooter from "./CopyrightFooter";
import FooterContent from "./FooterContent";
import { LOGO } from "@/utils/constants";
import horecaBenelux from "../../../public/images/horeca-benelux.webp";

const index = ({ footerStyle = "" }) => {
  return (
    <footer className={`main-footer ${footerStyle}`}>
      <div className="auto-container">
        <div className="widgets-section" data-aos="fade-up">
          <div className="row">

            {/* ================= LEFT COLUMN ================= */}
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo footer-logo">
                  <a href="/">
                    <Image
                      width={180}
                      height={90}
                      src="/images/de-flexi-jobber-logo-white.png"
                      alt="De Flexijobber Logo"
                      priority
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

            {/* ================= RIGHT COLUMN ================= */}
            <div className="big-column col-xl-8 col-lg-9 col-md-12">
              <div className="row">

                <FooterContent />

                {/* Horeca Benelux */}
                <div className="footer-column col-lg-5 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">
                      In samenwerking met Horeca Benelux
                    </h4>

                    <div className="widget-content horeca-partner">
                      <a
                        href="https://www.facebook.com/Partyeventsaruba"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Horeca Benelux"
                      >
                        <Image
                          width={150}
                          height={75}
                          src={horecaBenelux}
                          alt="Horeca Benelux"
                        />
                      </a>

                      <a
                        href="https://www.facebook.com/Partyeventsaruba"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Horeca Benelux partner"
                      >
                        <Image
                          width={240}
                          height={120}
                          src="/images/horeca-flexi.jpg"
                          alt="Horeca netwerk Benelux"
                        />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Facebook groep */}
                <div className="footer-column col-lg-4 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget facebook-group-widget">
                    <h4 className="widget-title">
                      Volg onze Facebook groep
                    </h4>

                    <a
                      href="https://www.facebook.com/groups/1386674879413028/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook groep Flexi-jobs in Vlaanderen"
                      className="facebook-group-logo"
                    >
                      <Image
                        width={130}
                        height={130}
                        src="/images/flexijobber-logo.jpg"
                        alt="Flexi-jobs in Vlaanderen Facebook groep"
                      />
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <CopyrightFooter />
    </footer>
  );
};

export default index;
