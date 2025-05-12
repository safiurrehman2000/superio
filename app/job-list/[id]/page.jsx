"use client";
import { useGetJobById } from "@/APIs/auth/jobs";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import JobOverView2 from "@/components/job-single-pages/job-overview/JobOverView2";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import CompnayInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import Contact from "@/components/job-single-pages/shared-components/Contact";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import Loading from "@/components/loading/Loading";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const JobSingleDynamicV3 = ({ params }) => {
  const selector = useSelector((store) => store.user);
  const id = params.id;
  const { job, loading, error } = useGetJobById(id);
  const hasApplied = selector.appliedJobs.includes(id);

  // Destructure job properties with default values
  const {
    jobTitle = "",
    company = "",
    location = "",
    time = "",
    salary = "",
    jobType = [],
    logo = "",
    link = "",
  } = job || {};

  const { push } = useRouter();

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>No job found</div>;

  // Ensure jobType is an array before mapping
  const jobTypeArray = Array.isArray(jobType) ? jobType : [];

  return (
    <>
      {/* <!-- Header Span --> */}

      <LoginPopup />
      <DefaulHeader2 />
      <MobileMenu />

      <section className="job-detail-section">
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  <div className="job-block-seven style-two">
                    <div className="inner-box">
                      <div className="content">
                        <h4>{jobTitle}</h4>
                        <ul className="job-info">
                          <li>
                            <span className="icon flaticon-briefcase"></span>
                            {company}
                          </li>
                          <li>
                            <span className="icon flaticon-map-locator"></span>
                            {location}
                          </li>
                          <li>
                            <span className="icon flaticon-clock-3"></span>
                            {time}
                          </li>
                          <li>
                            <span className="icon flaticon-money"></span>
                            {salary}
                          </li>
                        </ul>
                        <ul className="job-other-info">
                          {jobTypeArray.map((val, i) => (
                            <li key={i} className={val.styleClass}>
                              {val.type}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="job-overview-two">
                  <h4>Job Description</h4>
                  <JobOverView2 />
                </div>

                <JobDetailsDescriptions />

                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <SocialTwo />
                  </div>
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="btn-box">
                    {selector.user ? (
                      <button
                        disabled={hasApplied}
                        href="#"
                        className={`theme-btn ${
                          hasApplied ? "btn-style-three" : "btn-style-one"
                        }`}
                        data-bs-toggle="modal"
                        data-bs-target="#applyJobModal"
                      >
                        {hasApplied ? "Applied" : "Apply for Job"}
                      </button>
                    ) : (
                      <button
                        onClick={() => push(`/login?id=${id}`)}
                        className="theme-btn btn-style-one"
                      >
                        Login to Apply
                      </button>
                    )}
                    <button className="bookmark-btn">
                      <i className="flaticon-bookmark"></i>
                    </button>
                  </div>

                  <div
                    className="modal fade"
                    id="applyJobModal"
                    tabIndex="-1"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div className="apply-modal-content modal-content">
                        <div className="text-center">
                          <h3 className="title">Apply for this job</h3>
                          <button
                            type="button"
                            className="closed-modal"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <ApplyJobModalContent />
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <Image
                            width={54}
                            height={53}
                            src={logo}
                            alt="resource"
                          />
                        </div>
                        <h5 className="company-name">{company}</h5>
                        <a href="#" className="profile-link">
                          View company profile
                        </a>
                      </div>

                      <CompnayInfo />

                      <div className="btn-box">
                        <a
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-btn btn-style-three"
                        >
                          {link}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-widget contact-widget">
                    <h4 className="widget-title">Contact Us</h4>
                    <div className="widget-content">
                      <div className="default-form">
                        <Contact />
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="related-jobs">
              <div className="title-box">
                <h3>Related Jobs</h3>
                <div className="text">2020 jobs live - 293 added today.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default dynamic(() => Promise.resolve(JobSingleDynamicV3), {
  ssr: false,
});
