"use client";
import { useGetJobById, useSaveJob, useUnsaveJob } from "@/APIs/auth/jobs";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import CompnayInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import Loading from "@/components/loading/Loading";
import { addSavedJob, removeSavedJob } from "@/slices/userSlice";
import { formatString } from "@/utils/constants";
import { errorToast } from "@/utils/toast";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TbBookmark, TbBookmarkFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";

const JobSingleDynamicV3 = ({ params }) => {
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);

  const id = params.id;
  const { job, loading, error } = useGetJobById(id);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (selector?.savedJobs) {
      const isAlreadySaved = selector.savedJobs.some(
        (savedJob) => savedJob.jobId === id
      );
      setIsBookmarked(isAlreadySaved);
    }
  }, [selector.savedJobs, id]);

  const handleBookmarkClick = async () => {
    try {
      setBookmarkLoading(true);
      if (!selector?.user?.uid) {
        errorToast("Please login to bookmark a job");
        return;
      }

      if (selector?.userType !== "Candidate") {
        errorToast("Employer cannot bookmark a job");
        return;
      }

      const isAlreadySaved = selector.savedJobs?.some(
        (job) => job.jobId === id
      );

      if (isAlreadySaved) {
        await useUnsaveJob(selector.user.uid, id);
        dispatch(removeSavedJob(id));
        setIsBookmarked(false);
      } else {
        const savedJob = await useSaveJob(selector.user.uid, id);
        if (savedJob) {
          dispatch(addSavedJob(savedJob));
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
      errorToast("Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const [hasApplied, setHasApplied] = useState(
    selector.appliedJobs.some((job) => job.id === id)
  );

  const onApplicationSuccess = () => {
    setHasApplied(true);
  };

  const [logo, setLogo] = useState(null);

  const logoGetter = (logo) => {
    const logoSrc = logo
      ? logo.startsWith("data:image")
        ? logo // Already a Data URL
        : `data:image/jpeg;base64,${logo}`
      : "/images/resource/company-6.png";
    setLogo(logoSrc);
  };

  const { push } = useRouter();

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>No job found</div>;

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
                        <h4>{formatString(job?.title)}</h4>
                        <ul className="job-info">
                          <li>
                            <span className="icon flaticon-briefcase"></span>
                            {formatString(job?.jobType)}
                          </li>
                          <li>
                            <span className="icon flaticon-map-locator"></span>
                            {formatString(job?.location)}
                          </li>
                          <li>
                            <span className="icon flaticon-clock-3"></span>
                            {new Date(job?.createdAt)?.toLocaleDateString()}
                          </li>
                        </ul>
                        <ul className="job-other-info">
                          {job?.tags?.map((val, i) => (
                            <li key={i} className={val.styleClass}>
                              {val.type}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <JobDetailsDescriptions description={job.description} />

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
                        disabled={
                          hasApplied || selector.userType === "Employer"
                        }
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
                    <button
                      onClick={handleBookmarkClick}
                      className="bookmark-btn"
                      disabled={bookmarkLoading}
                      aria-label={
                        isBookmarked ? "Remove bookmark" : "Add bookmark"
                      }
                      style={{
                        alignItems: !bookmarkLoading ? "center" : undefined,
                      }}
                    >
                      {bookmarkLoading ? (
                        <CircularLoader strokeColor="#000" />
                      ) : isBookmarked ? (
                        <TbBookmarkFilled style={{ color: "#FA5508" }} />
                      ) : (
                        <TbBookmark />
                      )}
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
                        <ApplyJobModalContent
                          onApplicationSuccess={onApplicationSuccess}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <Image
                            width={54}
                            height={54}
                            src={logo || "/images/resource/company-6.png"}
                            alt="resource"
                            style={{
                              borderRadius: "50%",
                              objectFit: "cover",
                              height: "55px",
                              width: "55px",
                            }}
                          />
                        </div>
                        <h5 className="company-name">{job?.company}</h5>
                        <a
                          href={`/company-profile/${job?.employerId}`}
                          className="profile-link"
                        >
                          View company profile
                        </a>
                      </div>

                      <CompnayInfo
                        logoFn={logoGetter}
                        companyId={job?.employerId}
                      />

                      <div className="btn-box">
                        <a
                          href={job?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-btn btn-style-three"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
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
