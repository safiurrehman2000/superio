"use client";
import { useGetUserById } from "@/APIs/auth/database";
import { useGetCompanyJobListings } from "@/APIs/auth/jobs";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import PrivateMessageBox from "@/components/employer-single-pages/shared-components/PrivateMessageBox";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import Loading from "@/components/loading/Loading";
import { formatString } from "@/utils/constants";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EmployersSingleV1 = () => {
  const params = useParams();
  const [jobs, setJobs] = useState([]);
  console.log("jobs", jobs);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { jobs: fetchedJobs } = await useGetCompanyJobListings(
          params?.id
        );
        setJobs(fetchedJobs);
      } catch (err) {
        console.log("err :>> ", err);
      }
    };

    fetchJobs();
  }, [params?.id]);

  const { data, loading, error } = useGetUserById(params?.id);
  console.log("data", data);
  const logoSrc = data?.logo
    ? data.logo.startsWith("data:image")
      ? data.logo // Already a Data URL
      : `data:image/jpeg;base64,${data.logo}`
    : "/images/resource/company-6.png";

  if (!params?.id) {
    return <div>Error: No company ID provided</div>;
  }
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Job Detail Section --> */}
      <section className="job-detail-section">
        {/* <!-- Upper Box --> */}
        <div className="upper-box">
          <div className="auto-container">
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <Image
                      width={100}
                      height={100}
                      src={logoSrc || "/images/resource/company-6.png"}
                      alt="logo"
                      style={{
                        borderRadius: "50%",
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </span>
                  <h4>{formatString(data?.company_name) || "N/A"}</h4>

                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {formatString(data?.company_location) || "N/A"}
                    </li>
                    {/* compnay info */}
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {formatString(data?.company_type?.[0]?.value) || "N/A"}
                    </li>
                    {/* location info */}
                    <li>
                      <span className="icon flaticon-telephone-1"></span>
                      {data?.phone || "N/A"}
                    </li>
                    {/* time info */}
                    <li>
                      <span className="icon flaticon-mail"></span>
                      {data?.email || "N/A"}
                    </li>
                    {/* salary info */}
                  </ul>
                  {/* End .job-info */}

                  <ul className="job-other-info">
                    <li className="time">Open Jobs – {jobs?.length || 0}</li>
                  </ul>
                  {/* End .job-other-info */}
                </div>
                {/* End .content */}

                <div className="btn-box">
                  <button
                    className="theme-btn btn-style-one"
                    data-bs-toggle="modal"
                    data-bs-target="#privateMessage"
                  >
                    Private Message
                  </button>
                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
                {/* End btn-box */}

                {/* <!-- Modal --> */}
                <div
                  className="modal fade"
                  id="privateMessage"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">
                          Send message to{" "}
                          {formatString(data?.company_name) || "N/A"}
                        </h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      {/* End modal-header */}

                      <PrivateMessageBox />
                      {/* End PrivateMessageBox */}
                    </div>
                    {/* End .send-private-message-wrapper */}
                  </div>
                </div>
                {/* End .modal */}
              </div>
            </div>
            {/* <!-- Job Block --> */}
          </div>
        </div>
        {/* <!-- Upper Box --> */}

        {/* <!-- job-detail-outer--> */}
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {/*  job-detail */}
                <div className="job-detail">
                  <h4>About Company</h4>
                  <p>
                    {data?.description || "No company description available."}
                  </p>
                </div>
                {/* End job-detail */}

                {/* <!-- Related Jobs --> */}
                <div className="related-jobs">
                  <div className="title-box">
                    <h3>{jobs?.length || 0} Others jobs available</h3>
                  </div>
                  {/* End .title-box */}

                  {jobs?.length > 0 ? (
                    jobs?.map((item) => (
                      <div className="job-block" key={item.id}>
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              <Image
                                width={50}
                                height={50}
                                src={logoSrc}
                                alt="resource"
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            </span>
                            <h4>
                              <Link href={`/job-list/${item.id}`}>
                                {formatString(item?.title) ||
                                  "Untitled Position"}
                              </Link>
                            </h4>

                            <ul className="job-info">
                              <li>
                                <span className="icon flaticon-briefcase"></span>
                                {formatString(item?.jobType) || "N/A"}
                              </li>
                              {/* compnay info */}
                              <li>
                                <span className="icon flaticon-map-locator"></span>
                                {formatString(item?.location) || "N/A"}
                              </li>
                              {/* location info */}
                              <li>
                                <span className="icon flaticon-clock-3"></span>{" "}
                                {item?.createdAt
                                  ? new Date(
                                      item?.createdAt
                                    )?.toLocaleDateString()
                                  : "N/A"}
                              </li>
                              {/* time info */}
                            </ul>
                            {/* End .job-info */}

                            <ul className="job-other-info">
                              {item?.tags?.length > 0 ? (
                                item?.tags?.map((val, i) => {
                                  let styleClass = "";
                                  if (i % 3 === 0) {
                                    styleClass = "time";
                                  } else if (i % 3 === 1) {
                                    styleClass = "privacy";
                                  } else {
                                    styleClass = "required";
                                  }

                                  return (
                                    <li key={i} className={styleClass}>
                                      {formatString(val) || "N/A"}
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="time">No tags available</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p>No jobs available at the moment.</p>
                    </div>
                  )}
                  {/* End RelatedJobs */}
                </div>
                {/* <!-- Related Jobs --> */}
              </div>
              {/* End .content-column */}

              {/* End .sidebar-column */}
            </div>
          </div>
        </div>
        {/* <!-- job-detail-outer--> */}
      </section>
      {/* <!-- End Job Detail Section --> */}
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployersSingleV1), {
  ssr: false,
});
