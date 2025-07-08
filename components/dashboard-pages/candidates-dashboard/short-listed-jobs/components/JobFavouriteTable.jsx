"use client";
import Link from "next/link.js";
import Image from "next/image.js";
import { useSelector } from "react-redux";
import { formatString } from "@/utils/constants";
import { useState } from "react";

const JobFavouriteTable = () => {
  const selector = useSelector((store) => store.user);
  const jobs = selector?.savedJobs ?? [];

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("1"); // default to 1 month
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Filter jobs by selected months (using savedAt)
  const now = new Date();
  const months = parseInt(selectedFilter, 10);
  const filteredJobs = jobs.filter((job) => {
    if (!job.savedAt) return false;
    const jobDate = new Date(job.savedAt);
    const monthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - months,
      now.getDate()
    );
    return jobDate >= monthsAgo;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const paginatedJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Favorite Jobs</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select
            className="chosen-single form-select"
            value={selectedFilter}
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="1">Last 1 Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="9">Last 9 Months</option>
            <option value="12">Last 12 Months</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="table-outer">
          <div className="table-outer">
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedJobs?.map((item, index) => {
                  const logoSrc = item?.logo
                    ? item?.logo.startsWith("data:image")
                      ? item?.logo // Already a Data URL
                      : `data:image/jpeg;base64,${item?.logo}`
                    : "/images/resource/company-6.png";
                  return (
                    <tr key={item?.id}>
                      <td>
                        {/* <!-- Job Block --> */}
                        <div className="job-block">
                          <div className="inner-box">
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
                                    <p style={{ margin: 0, color: "white" }}>
                                      {item?.email?.charAt(0).toUpperCase() +
                                        " " +
                                        item?.email?.charAt(1).toUpperCase()}
                                    </p>
                                  </div>
                                )}
                              </span>
                              <h4>
                                <Link href={`/job-list/${item?.jobId}`}>
                                  {formatString(item?.title)}
                                </Link>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span>
                                  {formatString(item?.jobType)}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span>
                                  {formatString(item?.location)}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.savedAt
                          ? new Date(item.savedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="status">Active</td>
                      <td>
                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Aplication">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination Controls */}
        {filteredJobs.length > jobsPerPage && (
          <div
            className="pagination-controls"
            style={{ marginTop: 20, textAlign: "center" }}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ marginRight: 8 }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                disabled={currentPage === i + 1}
                style={{
                  fontWeight: currentPage === i + 1 ? "bold" : "normal",
                  marginRight: 4,
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ marginLeft: 8 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobFavouriteTable;
