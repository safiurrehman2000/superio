"use client";

import { useSelector } from "react-redux";
import FooterDefault from "../../../components/footer/common-footer";
import { CandidateLocationProvider } from "@/utils/hooks/CandidateLocationContext";
import LoginPopup from "../../common/form/login/LoginPopup";
import DefaulHeader2 from "../../header/DefaulHeader2";
import MobileMenu from "../../header/MobileMenu";
import FilterJobBox from "./FilterJobBox";
import JobSearchForm from "./JobSearchForm";

const index = () => {
  const userType = useSelector((store) => store.user?.userType);

  return (
    <CandidateLocationProvider autoRequest={userType !== "Employer"}>
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* End Header with upload cv btn */}

      <MobileMenu />
      {/* End MobileMenu */}

      <section className="page-title style-three">
        <div className="auto-container">
          <JobSearchForm />
          {/* <!-- Job Search Form --> */}
        </div>
      </section>
      {/* <!--End Page Title--> */}

      <section className="ls-section style-three">
        <div className="auto-container">
          <div className="row">
            <div className="content-column col-lg-12">
              <div className="ls-outer">
                <FilterJobBox />
              </div>
            </div>
            {/* <!-- End Content Column --> */}
          </div>
          {/* End row */}
        </div>
        {/* End container */}
      </section>
      {/* <!--End Listing Page Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </CandidateLocationProvider>
  );
};

export default index;
