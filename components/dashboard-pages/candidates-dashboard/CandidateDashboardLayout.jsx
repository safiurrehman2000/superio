"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "@/components/header/DashboardCandidatesSidebar";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import MenuToggler from "../MenuToggler";
import CopyrightFooter from "../CopyrightFooter";

const CandidateDashboardLayout = ({ children, title = "Dashboard" }) => {
  return (
    <div className="page-wrapper dashboard">
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* End Header */}

      <MobileMenu />
      {/* End MobileMenu */}

      <DashboardCandidatesSidebar />
      {/* <!-- End Candidates Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <Breadcrumb title={title} />
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

export default CandidateDashboardLayout;
