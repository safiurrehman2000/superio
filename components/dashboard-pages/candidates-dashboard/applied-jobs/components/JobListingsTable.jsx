"use client";
import Link from "next/link.js";
import Image from "next/image.js";
import { useSelector } from "react-redux";
import { formatString } from "@/utils/constants";
import { useState } from "react";

const JobListingsTable = () => {
  const selector = useSelector((store) => store.user);
  const jobs = selector?.appliedJobs;

  // Add filter state
  const [selectedFilter, setSelectedFilter] = useState("1"); // default to 1 month

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Filter jobs by selected months
  const now = new Date();
  const months = parseInt(selectedFilter, 10);
  const filteredJobs = jobs.filter((job) => {
    if (!job.createdAt) return false;
    const jobDate = new Date(job.createdAt);
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
        <h4>My Applied Jobs</h4>

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
                {paginatedJobs?.map((item) => {
                  const logoSrc = item?.logo
                    ? item.logo.startsWith("data:image")
                      ? item.logo // Already a Data URL
                      : `data:image/jpeg;base64,${item.logo}`
                    : "/images/resource/company-6.png";
                  return (
                    <tr key={item.id}>
                      <td>
                        {/* <!-- Job Block --> */}
                        <div className="job-block">
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <Image
                                  width={50}
                                  height={49}
                                  src={logoSrc}
                                  alt="logo"
                                  style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    height: "50px",
                                    width: "50px",
                                  }}
                                />
                              </span>
                              <h4>
                                <Link href={`/job-list/${item?.id}`}>
                                  {item?.title}
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
                      <td>{new Date(item?.createdAt)?.toLocaleDateString()}</td>
                      <td className="status">
                        {item?.status || (
                          <p style={{ color: "black", margin: 0 }}>NA</p>
                        )}
                      </td>
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
      </div>
      {/* End table widget content */}
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
  );
};

export default JobListingsTable;
