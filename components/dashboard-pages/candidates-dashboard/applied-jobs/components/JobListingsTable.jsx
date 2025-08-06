"use client";
import Link from "next/link.js";
import Image from "next/image.js";
import { useSelector } from "react-redux";
import { formatString } from "@/utils/constants";
import { useState, useEffect } from "react";
import { useGetAppliedJobsPaginated } from "@/APIs/auth/jobs";

const JobListingsTable = () => {
  const selector = useSelector((store) => store.user);
  const candidateId = selector?.user?.uid;

  // Add filter state
  const [selectedFilter, setSelectedFilter] = useState(1); // default to 1 month

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // State for paginated data
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch paginated jobs
  const fetchPaginatedJobs = async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      const result = await useGetAppliedJobsPaginated(
        candidateId,
        currentPage,
        jobsPerPage,
        selectedFilter
      );

      setJobs(result.jobs);
      setTotalJobs(result.totalJobs);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching paginated jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs when page, filter, or candidateId changes
  useEffect(() => {
    fetchPaginatedJobs();
  }, [currentPage, selectedFilter, candidateId]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    const newFilter = parseInt(e.target.value, 10);
    setSelectedFilter(newFilter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (loading) {
    return (
      <div className="tabs-box">
        <div className="widget-title">
          <h4>My Applied Jobs</h4>
        </div>
        <div className="widget-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select
            className="chosen-single form-select"
            value={selectedFilter}
            onChange={handleFilterChange}
          >
            <option value={1}>Last 1 Month</option>
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={9}>Last 9 Months</option>
            <option value={12}>Last 12 Months</option>
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
                {jobs?.map((item) => {
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
                      <td>{new Date(item?.appliedAt)?.toLocaleDateString()}</td>
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
      {totalPages > 1 && (
        <div
          className="pagination-controls"
          style={{ marginTop: 20, textAlign: "center" }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              backgroundColor: currentPage === 1 ? "#f3f4f6" : "#ffffff",
              color: currentPage === 1 ? "#9ca3af" : "#374151",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              minWidth: "80px",
              marginRight: "8px",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              disabled={currentPage === i + 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                backgroundColor: currentPage === i + 1 ? "#007bff" : "#ffffff",
                color: currentPage === i + 1 ? "#ffffff" : "#374151",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: currentPage === i + 1 ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: "40px",
                marginRight: "4px",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== i + 1) {
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== i + 1) {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.borderColor = "#d1d5db";
                }
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              backgroundColor:
                currentPage === totalPages ? "#f3f4f6" : "#ffffff",
              color: currentPage === totalPages ? "#9ca3af" : "#374151",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              minWidth: "80px",
              marginLeft: "8px",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = "#f9fafb";
                e.target.style.borderColor = "#9ca3af";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListingsTable;
