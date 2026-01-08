import LoginPopup from "../../common/form/login/LoginPopup";
import Partner from "../../common/partner/Partner";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import Funfact from "../../fun-fact-counter/Funfact";
import ImgBox from "./ImgBox";
import IntroDescriptions from "./IntroDescriptions";
import CallToAction2 from "../../call-to-action/CallToAction2";
import Testimonial2 from "../../testimonial/Testimonial2";
import Block1 from "../../block/Block1";
import Breadcrumb from "../../common/Breadcrumb";
import Image from "next/image";

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

      <Breadcrumb title="Over Ons" meta="Over Ons" />
      {/* <!--End Page Title--> */}

      <section className="about-section-three">
        <div className="auto-container">
          <IntroDescriptions />
          <ImgBox />

          {/* <!-- Fun Fact Section 
          <div className="fun-fact-section">
            <div className="row">
              <Funfact />
            </div>
          </div>
          {/* <!-- Fun Fact Section --> */}

        </div>
      </section>
      {/* <!-- End About Section Three --> */}

      <CallToAction2 />
      {/* <!-- End CallToAction2 --> */}


      {/* <!-- <section className="testimonial-section-two">
        <div className="container-fluid">
          <div className="testimonial-left">
            <Image
              width={504}
              height={451}
              src="/images/resource/testimonial-left.png"
              alt="testimonial"
            />
          </div>
          {/* End left img group 

          <div className="testimonial-right">
            <Image
              width={504}
              height={451}
              src="/images/resource/testimonial-right.png"
              alt="testimonial"
            />
          </div>
          {/* End right img group 

          <div className="sec-title text-center">
            <h2>Testimonials From Our Customers</h2>
            <div className="text">
              Lorem ipsum dolor sit amet elit, sed do eiusmod tempor
            </div>
          </div>
          {/* <!-- Sec Title 

          <div className="carousel-outer" data-aos="fade-up">
            <div className="testimonial-carousel">
              <Testimonial2 />
            </div>
            {/* <!-- Testimonial Carousel 
          </div>
        </div>
      </section>
      {/* <!-- End Testimonial Section 

      <section className="clients-section">
        <div className="sponsors-outer" data-aos="fade">
          {/* <!--Sponsors Carousel--> 
          <ul className="sponsors-carousel">
            <Partner />
          </ul>
        </div>
      </section>
      {/* <!-- End Clients Section--> */}

      <FooterDefault />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
