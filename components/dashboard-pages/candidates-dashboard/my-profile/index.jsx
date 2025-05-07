"use client";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { useSelector } from "react-redux";
import BreadCrumb from "../../BreadCrumb";
import CvUploader from "../cv-manager/components/CvUploader";
import { errorToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

const index = () => {
  // const { push } = useRouter();
  // const selector = useSelector((store) => store.user);
  return (
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
          <BreadCrumb title="Upload your CV" />
          {/* breadCrumb */}

          <div className="row">
            <div className="col-lg-12">
              {/* <!-- Ls widget --> */}
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>Cv Manager</h4>
                </div>
                {/* End widget-title */}
                <div className="widget-content">
                  <CvUploader />
                </div>
                {/* End widget-content */}
              </div>
              {/* End Ls widget */}
            </div>
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End dashboard-outer */}
        {/* <button
          disabled={selector.isFirstTime}
          onClick={() => {
            if (!selector.isFirstTime) {
              push("/job-list");
            } else {
              errorToast("Please upload your CV/Resume");
              return;
            }
          }}
          className={`theme-btn btn-style-one btn `}
        >
          Go to Job Apply
        </button> */}
      </section>
      {/* <!-- End Dashboard --> */}
    </div>
  );
};

export default index;
