"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TbBookmark, TbBookmarkFilled } from "react-icons/tb";

import {
  checkIfJobApplied,
  checkIfJobSaved,
  useSaveJob,
  useUnsaveJob,
  useJobViewIncrement,
} from "@/APIs/auth/jobs";

import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import JobDetailsDescriptions from "@/components/job-single-pages/shared-components/JobDetailsDescriptions";
import SocialTwo from "@/components/job-single-pages/social/SocialTwo";
import CompnayInfo from "@/components/job-single-pages/shared-components/CompanyInfo";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { errorToast } from "@/utils/toast";
import { formatString } from "@/utils/constants";

export default function JobClient({ job }) {
  const router = useRouter();
  const selector = useSelector((store) => store.user);

  useJobViewIncrement(job.id, selector.user);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (!selector?.user?.uid) return;

    checkIfJobSaved(selector.user.uid, job.id).then(setIsBookmarked);
    checkIfJobApplied(selector.user.uid, job.id).then(setHasApplied);
  }, [selector?.user?.uid, job.id]);

  const toggleBookmark = async () => {
    if (!selector?.user?.uid) {
      errorToast("Log in om een job op te slaan");
      return;
    }

    setBookmarkLoading(true);
    if (isBookmarked) {
      await useUnsaveJob(selector.user.uid, job.id);
      setIsBookmarked(false);
    } else {
      await useSaveJob(selector.user.uid, job.id);
      setIsBookmarked(true);
    }
    setBookmarkLoading(false);
  };

  const logoGetter = (logo) => {
    const logoSrc = logo
      ? logo.startsWith("data:image")
        ? logo
        : `data:image/jpeg;base64,${logo}`
      : "/images/resource/company-6.png";
    setLogo(logoSrc);
  };

  return (
    <section className="job-detail-section">
      <div className="job-detail-outer">
        <div className="auto-container">
          <div className="row">

            {/* CONTENT */}
            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              <div className="job-block-outer">
                <div className="job-block-seven style-two">
                  <div className="inner-box">
                    <div className="content">
                      <h4>{formatString(job.title)}</h4>

                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-briefcase"></span>
                          {formatString(job.jobType)}
                        </li>
                        <li>
                          <span className="icon flaticon-map-locator"></span>
                          {formatString(job.location)}
                        </li>
                        <li>
                          <span className="icon flaticon-clock-3"></span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </li>
                      </ul>

                      <ul className="job-other-info">
                        {job?.tags?.map((tag, i) => (
                          <li key={i} className={tag.styleClass}>
                            {tag.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <JobDetailsDescriptions
                description={job.description}
                functionDescription={job.functionDescription}
                profileSkills={job.profileSkills}
                offer={job.offer}
                schedule={job.schedule}
              />

              <div className="other-options">
                <div className="social-share">
                  <h5>Deel deze vacature</h5>
                  <SocialTwo />
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
              <aside className="sidebar">

                <div className="btn-box">
                  {selector.user ? (
                    <button
                      disabled={hasApplied || selector.userType === "Employer"}
                      className={`theme-btn ${
                        hasApplied ? "btn-style-three" : "btn-style-one"
                      }`}
                      data-bs-toggle="modal"
                      data-bs-target="#applyJobModal"
                    >
                      {hasApplied ? "Gesolliciteerd" : "Solliciteer"}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/login?id=${job.id}`)}
                      className="theme-btn btn-style-one"
                    >
                      Log in om te solliciteren
                    </button>
                  )}

                  <button
                    onClick={toggleBookmark}
                    className="bookmark-btn"
                    disabled={bookmarkLoading}
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

                {/* MODAL */}
                <div
                  className="modal fade"
                  id="applyJobModal"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">Solliciteer op vacature</h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                        />
                      </div>
                      <ApplyJobModalContent />
                    </div>
                  </div>
                </div>

                {/* COMPANY */}
                <div className="sidebar-widget company-widget">
                  <div className="widget-content">
                    <div className="company-title">
                      <div className="company-logo">
                        <Image
                          width={54}
                          height={54}
                          src={logo || "/images/resource/company-6.png"}
                          alt={job.company}
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <h5 className="company-name">{job.company}</h5>
                      <a
                        href={`/company-profile/${job.employerId}`}
                        className="profile-link"
                      >
                        Bekijk bedrijfsprofiel
                      </a>
                    </div>

                    <CompnayInfo
                      logoFn={logoGetter}
                      companyId={job.employerId}
                    />

                    {job.link && (
                      <div className="btn-box">
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-btn btn-style-three"
                        >
                          Bezoek Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
