import DefaulHeader2 from "@/components/header/DefaulHeader2";
import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import MobileMenu from "../../header/MobileMenu";
import PricingPackages from "./PricingPackages";

const index = () => {
  return (
    <>
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <Breadcrumb title="Prijzen" meta="Prijzen" /> */}
      {/* <!--End Page Title--> */}

      <section className="pricing-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2 style={{ color: "#fff" }}>Vacature Adverteren</h2>

            {/* Info Box */}
            <div
              style={{
                background:
                  "linear-gradient(45deg, rgba(7,35,67,0.92) 0%, rgba(0,116,225,0.82) 100%)",
                padding: "45px",
                borderRadius: "28px",
                color: "#fff",
                marginTop: "30px",
                marginBottom: "50px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h3
                style={{
                  color: "#fff",
                  marginBottom: "20px",
                  fontWeight: "700",
                }}
              >
                Vind razendsnel de ideale flexijobber of student voor jouw zaak!
              </h3>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Heb je extra handen nodig tijdens de drukke uren, in het weekend
                of voor een specifiek project? Op{" "}
                <strong style={{ color: "#fff" }}>De Flexijobber</strong> breng je
                jouw vacature direct onder de aandacht van gemotiveerde kandidaten
                die zin hebben om de handen uit de mouwen te steken.
              </p>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Plaats vandaag nog je advertentie en bouw aan een flexibel team
                dat met je meegroeit. Simpel, efficiënt en lokaal.
              </p>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Via het dashboard heb je een duidelijk overzicht van alle
                sollicitanten. Keur kandidaten gemakkelijk goed of af via het
                dashboard.
              </p>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Geen ingewikkelde prijzen, maar één duidelijke prijs per gekozen
                bundel.
              </p>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Wens je meerdere vacatures te adverteren? Vraag dan gerust een
                offerte op maat aan.
              </p>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Vergroot ook meteen jouw bereik via Google Jobs.
              </p>

              <p
                style={{
                  marginBottom: "0",
                  lineHeight: "1.8",
                  color: "#fff",
                }}
              >
                Heb je nog vragen? Dat begrijpen we! Gebruik de WhatsApp-knop
                voor onmiddellijk contact en antwoord op al jouw vragen.
              </p>
            </div>

            <div className="text">
              <PricingPackages />
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