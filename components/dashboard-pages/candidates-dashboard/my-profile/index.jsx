"use client";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import BreadCrumb from "../../BreadCrumb";
import ContactInfoBox from "./components/ContactInfoBox";
import MyProfile from "./components/my-profile";
import SocialNetworkBox from "./components/SocialNetworkBox";
import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";

const index = () => {
  const selector = useSelector((store) => store.stepper);
  const methods = useForm({ mode: "all" });
  return (
    <FormProvider {...methods}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "50px",
        }}
      >
        <header className={`header-shaddow }`}>
          <div className="container-fluid">
            {/* <!-- Main box --> */}
            <div className="main-box">
              {/* <!--Nav Outer --> */}
              <div className="nav-outer">
                <div className="logo-box">
                  <div className="logo text-center">
                    <Image
                      alt="brand"
                      src={LOGO}
                      width={154}
                      height={50}
                      priority
                    />
                  </div>
                </div>
                {/* End .logo-box */}

                {/* <!-- Main Menu End--> */}
              </div>
              {/* End .nav-outer */}

              {/* End outer-box */}
            </div>
          </div>
        </header>
        {/* <!-- Dashboard --> */}
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Create your Candidate Profile" />
            {/* breadCrumb */}
            <div className="row">
              <div className="col-lg-12">
                {selector.currentStep === 1 && (
                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>My Profile</h4>
                      </div>
                      <MyProfile />
                    </div>
                  </div>
                )}
                {/* <!-- Ls widget --> */}
                {selector.currentStep === 2 && (
                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>Social Network</h4>
                      </div>
                      {/* End widget-title */}

                      <div className="widget-content">
                        <SocialNetworkBox />
                      </div>
                    </div>
                  </div>
                )}
                {/* <!-- Ls widget --> */}
                {selector.currentStep === 3 && (
                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>Contact Information</h4>
                      </div>
                      {/* End widget-title */}
                      <div className="widget-content">
                        <ContactInfoBox />
                      </div>
                    </div>
                  </div>
                )}
                {/* <!-- Ls widget --> */}
              </div>
            </div>
            {/* End .row */}
          </div>
          {/* End dashboard-outer */}
        </section>
        {/* <!-- End Dashboard --> */}
      </div>
    </FormProvider>
  );
};

export default index;
