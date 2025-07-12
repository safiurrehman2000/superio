import DefaulHeader2 from "@/components/header/DefaulHeader2";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import DashboardAdminSidebar from "@/components/header/DashboardAdminSidebar";
import MobileMenu from "@/components/header/MobileMenu";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
import EditJobPost from "@/components/admin-dashboard-pages/edit-job-posts/components/EditJobPost";

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
      {/* <!-- End User Sidebar Menu --> */}

      {/* <!-- Dashboard --> */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Edit Job Posts" />
          {/* breadCrumb */}

          <MenuToggler />
          {/* Collapsible sidebar button */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <EditJobPost />
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
