"use client";

import { useGetJobListing, useSaveJob, useUnsaveJob } from "@/APIs/auth/jobs";
import { addSavedJob, removeSavedJob } from "@/slices/userSlice";
import { formatString, transformJobData } from "@/utils/constants";
import { errorToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { TbBookmark, TbBookmarkFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  addDatePosted,
  addExperienceSelect,
  addJobTypeSelect,
  addKeyword,
  addLocation,
  addPerPage,
  addSalary,
  addSort,
  clearTags,
} from "../../../features/filter/filterSlice";
import ListingShowing from "../components/ListingShowing";
import "./jobList.css";

const FilterJobBox = () => {
  const { data: jobs, loading, error } = useGetJobListing();
  const selector = useSelector((store) => store.user);
  const { jobList, jobSort } = useSelector((state) => state.filter);
  const dispatch = useDispatch();
  const transformedJobs = transformJobData(jobs || []);

  console.log("selector.savedJobs :>> ", selector.savedJobs);

  const {
    keyword,
    location,
    destination,
    category,
    datePosted,
    jobTypeSelect,
    experienceSelect,
    salary,
    tag,
  } = jobList || {};

  const { sort, perPage } = jobSort;

  const handleBookmark = async (jobId) => {
    try {
      if (!selector?.user?.uid) {
        errorToast("Please login to bookmark a job");
        return;
      }

      if (selector?.userType !== "Candidate") {
        errorToast("Employer cannot bookmark a job");
        return;
      }

      // Check both in local state and in the database
      const isAlreadySaved = selector.savedJobs?.some(
        (job) => job.jobId === jobId
      );

      if (isAlreadySaved) {
        await useUnsaveJob(selector.user.uid, jobId);
        dispatch(removeSavedJob(jobId));
      } else {
        // This will now check in the database before saving
        const savedJob = await useSaveJob(selector.user.uid, jobId);
        if (savedJob) {
          dispatch(addSavedJob(savedJob));
        }
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
      errorToast("Failed to update bookmark");
    }
  };

  // Keyword filter on title
  const keywordFilter = (item) =>
    keyword !== ""
      ? item.title.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
      : item;

  // Location filter (using state as location)
  const locationFilter = (item) =>
    location !== ""
      ? item.location
          ?.toLocaleLowerCase()
          .includes(location.toLocaleLowerCase())
      : item;

  // Destination filter (not in job object, placeholder)
  const destinationFilter = (item) => item;
  const tagsFilter = (item) =>
    tag.length === 0 || item.tags.some((t) => tag.includes(t.value));
  // Job-type filter
  const jobTypeFilter = (item) =>
    jobTypeSelect !== ""
      ? item.jobType?.toLocaleLowerCase() === jobTypeSelect.toLocaleLowerCase()
      : item;

  // Date-posted filter
  const datePostedFilter = (item) =>
    datePosted !== "all" && datePosted !== ""
      ? new Date(item.createdAt)
          .toLocaleDateString()
          .toLocaleLowerCase()
          .includes(datePosted.toLocaleLowerCase())
      : item;

  // Experience filter (not in job object, placeholder)
  const experienceFilter = (item) => item;

  // Salary filter (not in job object, placeholder)
  const salaryFilter = (item) => item;

  // Sort filter
  const sortFilter = (a, b) =>
    sort === "des" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;

  // Render job cards
  const content = jobs
    ?.filter(keywordFilter)
    ?.filter(locationFilter)
    ?.filter(destinationFilter)
    ?.filter(tagsFilter)
    ?.filter(jobTypeFilter)
    ?.filter(datePostedFilter)
    ?.filter(experienceFilter)
    ?.filter(salaryFilter)
    ?.sort(sortFilter)
    .slice(perPage.start, perPage.end !== 0 ? perPage.end : 16)
    ?.map((item, index) => {
      const logoSrc = item?.logo
        ? item.logo.startsWith("data:image")
          ? item.logo // Already a Data URL
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
              >
                {selector.savedJobs.some((job) => job.jobId === item.id) ? (
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

  // Sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // Per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // Clear all filters
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addCategory(""));
    dispatch(addJobTypeSelect(""));
    dispatch(addDatePosted(""));
    dispatch(addExperienceSelect(""));
    dispatch(addSalary({ min: 0, max: 20000 }));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 }));
    dispatch(clearTags());
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div>Error fetching jobs: {error.message}</div>;
  }

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            <strong>{content?.length || 0}</strong> jobs
          </div>
        </div>
        <div className="sort-by">
          {keyword !== "" ||
          location !== "" ||
          tag.length > 0 ||
          jobTypeSelect !== "" ||
          datePosted !== "" ||
          experienceSelect !== "" ||
          salary?.min !== 0 ||
          salary?.max !== 20000 ||
          sort !== "" ||
          perPage.start !== 0 ||
          perPage.end !== 0 ? (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
            >
              Clear All
            </button>
          ) : undefined}
          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
          </select>
          <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3"
            value={JSON.stringify(perPage)}
          >
            <option value={JSON.stringify({ start: 0, end: 0 })}>All</option>
            <option value={JSON.stringify({ start: 0, end: 20 })}>
              20 per page
            </option>
            <option value={JSON.stringify({ start: 0, end: 30 })}>
              30 per page
            </option>
            <option value={JSON.stringify({ start: 0, end: 40 })}>
              40 per page
            </option>
          </select>
        </div>
      </div>
      <div className="row">{content}</div>
      <ListingShowing />
    </>
  );
};

export default FilterJobBox;
