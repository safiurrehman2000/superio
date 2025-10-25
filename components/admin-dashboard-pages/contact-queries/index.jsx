"use client";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardAdminSidebar from "@/components/header/DashboardAdminSidebar";
import MobileMenu from "@/components/header/MobileMenu";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
import ContactQueriesPage from "./ContactQueriesPage";

const index = () => {
  return (
    <div className="page-wrapper dashboard">
      {/* <!-- Header Span for hight --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />

      <MobileMenu />
      {/* End MobileMenu */}

      <DashboardAdminSidebar />
      {/* <!-- End Admin Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Manage Contact Queries" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Contact Queries</h4>
                  </div>
                  <ContactQueriesPage />
                </div>
              </div>
            </div>
          </div>
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
