"use client";

import {
  createJobAlert,
  useGetJobListing,
  useSaveJob,
  useUnsaveJob,
} from "@/APIs/auth/jobs";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import {
  clearAllFilters,
  setJobs,
  setPagination,
  setSortOrder,
} from "@/features/job/newJobSlice";
import { addSavedJob, removeSavedJob } from "@/slices/userSlice";
import { formatString } from "@/utils/constants";
import { errorToast, successToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TbBookmark, TbBookmarkFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import ListingShowing from "../components/ListingShowing";
import "./jobList.css";
import JobAlertModal from "./JobAlertModal";
import Loading from "@/components/loading/Loading";

const FilterJobBox = () => {
  const { data: jobs, loading, error } = useGetJobListing();
  const selector = useSelector((store) => store.user);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const dispatch = useDispatch();
  const [bookmarkLoading, setBookmarkLoading] = useState(null);
  const {
    filteredJobs,
    jobs: allJobs,
    searchTerm,
    locationTerm,
    selectedCategory,
    selectedJobType,
    selectedDatePosted,
    sortOrder,
    pagination,
  } = useSelector((state) => state.newJob);

  const getPaginatedJobs = () => {
    if (pagination.itemsPerPage === Infinity || pagination.itemsPerPage === 0) {
      return filteredJobs || [];
    }
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredJobs?.slice(startIndex, endIndex) || [];
  };
  const paginatedJobs = getPaginatedJobs();
  const handlePageChange = (page) => {
    dispatch(setPagination({ currentPage: page }));
  };
  useEffect(() => {
    dispatch(
      setPagination({
        totalItems: filteredJobs?.length || 0,
        currentPage: 1,
      })
    );
  }, [filteredJobs, dispatch]);
  useEffect(() => {
    if (jobs) {
      dispatch(setJobs(jobs));
    }
  }, [jobs, dispatch]);

  const handleBookmark = async (jobId) => {
    try {
      setBookmarkLoading(jobId);
      if (!selector?.user?.uid) {
        errorToast("Please login to bookmark a job");
        return;
      }

      if (selector?.userType !== "Candidate") {
        errorToast("Employer cannot bookmark a job");
        return;
      }

      const isAlreadySaved = selector.savedJobs?.some(
        (job) => job.jobId === jobId
      );

      if (isAlreadySaved) {
        await useUnsaveJob(selector.user.uid, jobId);
        dispatch(removeSavedJob(jobId));
      } else {
        const savedJob = await useSaveJob(selector.user.uid, jobId);
        if (savedJob) {
          dispatch(addSavedJob(savedJob));
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
      errorToast("Failed to update bookmark");
    } finally {
      setBookmarkLoading(null);
    }
  };

  const handleSubmitModal = async (frequency) => {
    if (!selector?.user?.uid) {
      errorToast("Please log in to create job alerts.");
      return;
    }

    const result = await createJobAlert(selector?.user?.uid, frequency);
    if (result.success) {
      successToast("Job alert created successfully!");
    } else {
      errorToast(result.error || "Failed to create job alert.");
    }
    handleCloseModal();
  };

  const hasActiveFilters =
    searchTerm ||
    locationTerm ||
    selectedCategory ||
    selectedJobType ||
    selectedDatePosted ||
    sortOrder ||
    (filteredJobs && allJobs && filteredJobs.length !== allJobs.length) ||
    (pagination.itemsPerPage !== 20 && pagination.itemsPerPage !== Infinity);

  // Render job cards
  const content = paginatedJobs?.map((item, index) => {
    const logoSrc = item?.logo
      ? item.logo.startsWith("data:image")
        ? item.logo
        : `data:image/jpeg;base64,${item.logo}`
      : "/images/resource/company-6.png";
    return (
      <div className="job-block col-lg-6 col-md-12 col-sm-12" key={item.id}>
        <div className="inner-box hover-effect">
          <div className="content">
            <span className="company-logo">
              {item?.logo ? (
                <Image
                  width={50}
                  height={49}
                  src={logoSrc}
                  alt="company logo"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    height: "50px",
                    width: "50px",
                  }}
                />
              ) : (
                <div
                  style={{
                    borderRadius: "50%",
                    height: "50px",
                    width: "50px",
                    backgroundColor:
                      index % 3 === 0
                        ? "#FA5508"
                        : index % 3 === 1
                        ? "#10E7DC"
                        : "#0074E1",
                    textAlign: "center",
                    alignContent: "center",
                  }}
                >
                  <p style={{ color: "white" }}>
                    {item?.email?.charAt(0).toUpperCase() +
                      " " +
                      item?.email?.charAt(1).toUpperCase()}
                  </p>
                </div>
              )}
            </span>
            <h4>
              <Link href={`/job-list/${item.id}`}>
                {formatString(item?.title)}
              </Link>
            </h4>

            <ul className="job-info">
              <li>
                <span className="icon flaticon-briefcase"></span>
                {formatString(item?.jobType) || "Not specified"}
              </li>
              {/* compnay info */}
              <li>
                <span className="icon flaticon-map-locator"></span>
                {formatString(item?.location)}
              </li>
              {/* location info */}
              <li>
                <span className="icon flaticon-clock-3"></span>{" "}
                {new Date(item?.createdAt)?.toLocaleDateString()}
              </li>
              {/* time info */}
            </ul>
            {/* End .job-info */}

            <ul className="job-other-info">
              {item?.tags?.map((val, i) => {
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
                    {formatString(val)}
                  </li>
                );
              })}
            </ul>
            {/* End .job-other-info */}
            <button
              className="bookmark-btn"
              onClick={() => handleBookmark(item?.id)}
              disabled={bookmarkLoading === item.id}
            >
              {bookmarkLoading === item.id ? (
                <CircularLoader strokeColor="#000000" />
              ) : selector.savedJobs.some((job) => job.jobId === item.id) ? (
                <TbBookmarkFilled color="#FA5508" />
              ) : (
                <TbBookmark />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  });

  const totalPages = Math.ceil(
    (filteredJobs?.length || 0) / (pagination.itemsPerPage || 1)
  );
  // Sort handler
  const sortHandler = (e) => {
    const value = e.target.value;
    dispatch(setSortOrder(value));
  };

  const clearAll = () => {
    dispatch(clearAllFilters());
    dispatch(
      setPagination({
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: filteredJobs?.length || 0,
      })
    );
    dispatch(setSortOrder("")); // Reset sorting
  };

  // Per page handler
  const perPageHandler = (e) => {
    const value = e.target.value;
    const itemsPerPage = value === "0" ? Infinity : parseInt(value);
    dispatch(
      setPagination({
        itemsPerPage,
        currentPage: 1,
        totalItems: filteredJobs?.length || 0,
      })
    );
  };

  const getSelectValue = () => {
    return pagination.itemsPerPage === Infinity
      ? "0"
      : pagination.itemsPerPage.toString();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error fetching jobs: {error.message}</div>;
  }

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            Showing <strong>{content?.length || 0}</strong> of{" "}
            <strong>{filteredJobs?.length || 0}</strong> jobs
          </div>
        </div>

        <div className="sort-by">
          {/* {selector?.userType === "Candidate" && (
            <button className="btn btn-danger" onClick={handleOpenModal}>
              Create Job Alerts
            </button>
          )} */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
            >
              Clear All
            </button>
          )}

          <select
            className="chosen-single form-select"
            onChange={sortHandler}
            value={sortOrder}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Oldest</option>
            <option value="desc">Newest</option> {/* Fixed "des" to "desc" */}
          </select>

          <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3"
            value={getSelectValue()}
          >
            <option value="0">All</option>
            <option value="2">2 per page</option>
            <option value="3">3 per page</option>
            <option value="4">4 per page</option>
          </select>
        </div>
      </div>
      <div className="row">{content}</div>
      {totalPages > 1 && (
        <div className="ls-pagination">
          <ul className="pagination-list">
            {/* Previous Page Button */}
            <li className={pagination.currentPage === 1 ? "disabled" : ""}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <i className="fa fa-angle-left"></i>
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={pagination.currentPage === page ? "active" : ""}
              >
                <button onClick={() => handlePageChange(page)}>{page}</button>
              </li>
            ))}

            <li
              className={
                pagination.currentPage === totalPages ? "disabled" : ""
              }
            >
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
              >
                <i className="fa fa-angle-right"></i>
              </button>
            </li>
          </ul>
        </div>
      )}
      <ListingShowing />
      {showModal && selector?.userType === "Candidate" && (
        <JobAlertModal
          show={showModal}
          handleClose={handleCloseModal}
          onSubmit={handleSubmitModal}
        />
      )}
    </>
  );
};

export default FilterJobBox;
