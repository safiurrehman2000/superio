"use client";
import { useSelector } from "react-redux";
import Link from "next/link";
import RegBanner from "../block/RegBanner";
import Blog from "../blog/Blog";
import CallToAction2 from "../call-to-action/CallToAction2";
import LoginPopup from "../common/form/login/LoginPopup";
import FooterDefault from "../footer/common-footer";
import DefaulHeader2 from "../header/DefaulHeader2";
import MobileMenu from "../header/MobileMenu";
import Hero9 from "../hero/hero-9";
import CookiePopup from "components/cookie-popup/CookiePopup"
import JobCategorie1 from "../job-categories/JobCategorie1";
import JobFeatured1 from "../job-featured/JobFeatured1";

const index = () => {
  const selector = useSelector((store) => store.user);
  return (
    <>
      <CookiePopup />
      
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* End Header with upload cv btn */}

      <MobileMenu />
      {/* End MobileMenu */}

      <Hero9 />
      {/* End Hero Section */}
      {!selector.user && (
        <section className="layout-pt-60 layout-pb-60">
          <div className="auto-container">
            <div className="row" data-aos="fade-up">
              <RegBanner />
            </div>
          </div>
        </section>
      )}

      {/* <section className="job-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Featured Jobs</h2>
            <div className="text">
              Know your worth and find the job that qualify your life
            </div>
          </div>

          <div className="row " data-aos="fade-up">
            <JobFeatured1 />
          </div>
        </div>
      </section> */}
      {/* End Job Featured Section */}
      
      <CallToAction2 />

      <section className="news-section-two style-two">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Recente Nieuwsberichten</h2>
            <div className="text">
              Bekijk recente artikelen over loopbanen, werkgelegenheid en meer
            </div>
          </div>
          {/* End ."sec-title */}
          <div className="row" data-aos="fade-up">
            <Blog />
          </div>
        </div>
      </section>

      {/* Contact Us Hero Section */}
      <section
        className="contact-hero-section"
        style={{
          background: "linear-gradient(135deg, #0074E1 0%, #10E7DC 100%)",
          padding: "clamp(40px, 8vw, 80px) 0",
          color: "white",
        }}
      >
        <div className="auto-container">
          <div className="row justify-content-center">
            <div
              className="col-lg-8 col-md-10 col-sm-12 text-center"
              data-aos="fade-up"
            >
              <div className="sec-title text-center">
                <h2
                  style={{
                    color: "white",
                    marginBottom: "20px",
                    fontSize: "clamp(24px, 5vw, 36px)",
                    lineHeight: "1.3",
                  }}
                >
                  Heb je vragen? Neem contact met ons op!
                </h2>
                <div
                  className="text"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "clamp(14px, 3vw, 18px)",
                    marginBottom: "30px",
                    padding: "0 15px",
                  }}
                >
                  Ons team staat klaar om je te helpen met al je vragen over
                  vacatures, sollicitaties of onze diensten. We horen graag van
                  je!
                </div>
              </div>
              <div
                className="btn-box"
                style={{ marginTop: "30px", padding: "0 15px" }}
              >
                <Link
                  href="/contact"
                  className="theme-btn btn-style-one"
                  style={{
                    backgroundColor: "white",
                    color: "#667eea",
                    border: "2px solid white",
                    padding: "clamp(12px, 2vw, 15px) clamp(30px, 5vw, 40px)",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    fontWeight: "600",
                    borderRadius: "50px",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    width: "100%",
                    maxWidth: "300px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.color = "#667eea";
                  }}
                >
                  Contacteer Ons
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Contact Us Hero Section */}

      {/* Google Review Section */}
      <section
        className="google-review-section"
        style={{
          padding: "clamp(40px, 6vw, 70px) 0",
          backgroundColor: "#f9fbfd",
        }}
      >
        <div className="auto-container">
          <div className="row justify-content-center">
            <div
              className="col-lg-6 col-md-8 col-sm-12 text-center"
              data-aos="fade-up"
            >
              <div style={{ marginBottom: "25px" }}>
                <img
                  src="/images/google-review.png"
                  alt="Google Reviews"
                  style={{
                    maxWidth: "280px",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "clamp(15px, 3vw, 17px)",
                  color: "#555",
                  marginBottom: "25px",
                  lineHeight: "1.6",
                }}
              >
                <strong>Werkgever?</strong> We waarderen je feedback over onze
                samenwerking!
              </p>

              <Link
                href="https://www.google.com/search?sca_esv=b981c6def567073f&sxsrf=AHTn8zqCS8jcEuIf4eKVQpdFE-gkUBHHPA:1742816047528&q=reviews+voor+de+flexijobber&uds=ABqPDvztZD_Nu18FR6tNPw2cK_RR1Y2B-6v0nEZ_RNXr7jcQfLwW8Wc1J9mckm0JRLblsagLSD2iHa3O-jnkBr5uD-yXzEolHloIJXPb7-ZeLeldD49LmxblKOI_uzwwuv2w548izlxGEr_Ssz-CidRuvCbdeG_uAdDIwN0oFW88ft_JhBUcPhM&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzX635Ard0LmfaikNGk6gZ6MRUVfPD_mf5GSELWpVwmS-pG-S5qybqcgJVL0HIXMqEbTiKU_rUcT2H_74wJu_HROEG0VxeXsdw0CMYOG3_NZLJ1gZJA%3D%3D&sa=X&ved=2ahUKEwja16_bz6KMAxV2-wIHHRl0NHEQxKsJegQIGhAB&ictx=1&stq=1&cs=0&lei=L0PhZ5qEIPb2i-gPmejRiQc"
                target="_blank"
                rel="noopener noreferrer"
                className="google-review-btn"
                style={{
                  backgroundColor: "#00B7EA",
                  color: "#ffffff",
                  padding: "14px 36px",
                  borderRadius: "50px",
                  fontWeight: "600",
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#009ac6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#00B7EA";
                }}
              >
                Laat een Google review achter
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* End Google Review Section */}

      {/* <section className="job-categories style-two">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Popular Job Categories</h2>
            <div className="text">2020 jobs live - 293 added today.</div>
          </div>

          <div
            className="row "
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <JobCategorie1 />
          </div>
        </div>
      </section> */}

      <FooterDefault />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
