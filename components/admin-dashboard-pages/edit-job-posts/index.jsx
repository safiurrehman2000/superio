"use client";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import { useEffect, useState } from "react";
import LoginPopup from "../../common/form/login/LoginPopup";
import BreadCrumb from "../../dashboard-pages/BreadCrumb";
import CopyrightFooter from "../../dashboard-pages/CopyrightFooter";
import MenuToggler from "../../dashboard-pages/MenuToggler";
import DashboardAdmin from "../../header/DashboardAdminSidebar";
import MobileMenu from "../../header/MobileMenu";

const Index = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
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
          <BreadCrumb title="Admin Panel" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <EditJobPost />
          </div>
          {/* End .row profile and notificatins */}
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

export default Index;
