"use client";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import MobileMenu from "../../../header/MobileMenu";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import ContactInfoBox from "./components/ContactInfoBox";
import MyProfile from "./components/my-profile";
import SocialNetworkBox from "./components/SocialNetworkBox";
import { FormProvider, useForm } from "react-hook-form";

const index = () => {
  const methods = useForm({
    mode: "onChange",
  });
  return (
    <div className="page-wrapper dashboard">
      {/* <!-- Header Span for hight --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />

      <MobileMenu />
      {/* End MobileMenu */}

      <DashboardEmployerSidebar />
      {/* <!-- End User Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Company Profile!" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}
          <FormProvider {...methods}>
            <form>
              <div className="row">
                <div className="col-lg-12">
                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>My Profile</h4>
                      </div>
                      <MyProfile />
                    </div>
                  </div>
                  {/* <!-- Ls widget --> */}

                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>Social Network</h4>
                      </div>
                      {/* End .widget-title */}
                      <div className="widget-content">
                        <SocialNetworkBox />
                      </div>
                    </div>
                  </div>
                  {/* <!-- Ls widget --> */}

                  <div className="ls-widget">
                    <div className="tabs-box">
                      <div className="widget-title">
                        <h4>Contact Information</h4>
                      </div>
                      {/* End .widget-title */}

                      <div className="widget-content">
                        <ContactInfoBox />
                      </div>
                    </div>
                  </div>
                  {/* <!-- Ls widget --> */}
                </div>
              </div>
            </form>
          </FormProvider>
          {/* End .row */}
        </div>
        {/* End dashboard-outer */}
      </section>
      {/* <!-- End Dashboard --> */}

      <CopyrightFooter />
      {/* <!-- End Copyright --> */}
    </div>
    // End page-wrapper
  );
};

export default index;
