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
import JobCategorie1 from "../job-categories/JobCategorie1";
import JobFeatured1 from "../job-featured/JobFeatured1";

const index = () => {
  const selector = useSelector((store) => store.user);
  return (
    <>
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "80px 0",
          color: "white",
        }}
      >
        <div className="auto-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="sec-title text-center">
                <h2 style={{ color: "white", marginBottom: "20px" }}>
                  Heb je vragen? Neem contact met ons op!
                </h2>
                <div
                  className="text"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "18px",
                    marginBottom: "30px",
                  }}
                >
                  Ons team staat klaar om je te helpen met al je vragen over
                  vacatures, sollicitaties of onze diensten. We horen graag van
                  je!
                </div>
              </div>
              <div className="btn-box" style={{ marginTop: "30px" }}>
                <Link
                  href="/contact"
                  className="theme-btn btn-style-one"
                  style={{
                    backgroundColor: "white",
                    color: "#667eea",
                    border: "2px solid white",
                    padding: "15px 40px",
                    fontSize: "16px",
                    fontWeight: "600",
                    borderRadius: "50px",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
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
