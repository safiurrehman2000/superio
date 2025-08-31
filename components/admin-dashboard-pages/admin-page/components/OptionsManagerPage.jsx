"use client";
import DefaulHeader2 from "@/components/header/DefaulHeader2";

import OptionsManager from "./OptionsManager";
import { useState, useEffect } from "react";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import MobileMenu from "@/components/header/MobileMenu";
import DashboardAdmin from "@/components/header/DashboardAdminSidebar";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";

const OptionsManagerPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-wrapper dashboard">
      {/* <!-- Header Span for hight --> */}
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />

      <MobileMenu />
      {/* End MobileMenu */}

      <DashboardAdmin />
      {/* <!-- End User Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Manage Options" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {loading ? (
                <div className="ls-widget">
                  <div className="tabs-box">
                    <div className="widget-title">
                      <h4>Manage Options</h4>
                    </div>
                    <div className="widget-content">
                      <div className="loading">Loading...</div>
                    </div>
                  </div>
                </div>
              ) : (
                <OptionsManager />
              )}
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

export default OptionsManagerPage;
