"use client";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import DashboardEmployerSidebar from "@/components/header/DashboardEmployerSidebar";
import MobileMenu from "@/components/header/MobileMenu";
import BreadCrumb from "../BreadCrumb";
import CopyrightFooter from "../CopyrightFooter";
import MenuToggler from "../MenuToggler";
import LoginPopup from "@/components/common/form/login/LoginPopup";

const EmployerDashboardLayout = ({ children, title = "Dashboard" }) => {
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
          <BreadCrumb title={title} />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          {children}
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

export default EmployerDashboardLayout;
