"use client";
import { useFetchEmployerJobsPaginated, deleteJob } from "@/APIs/auth/jobs";
import { formatString } from "@/utils/constants";
import { errorToast, successToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DeleteConfirmationModal } from "./DeleteModal";
import ManageJobsSkeleton from "./ManageJobsSkeleton";

const JobListingsTable = () => {
  const selector = useSelector((store) => store.user);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const { push } = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("6"); // default to 6 months

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const months = parseInt(selectedFilter, 10);
        const result = await useFetchEmployerJobsPaginated(
          selector.user?.uid,
          currentPage,
          jobsPerPage,
          months,
        );
        setJobs(result.jobs || []);
        setTotalPages(result.totalPages);
        setTotalJobs(result.totalJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        errorToast("Failed to fetch job listings");
      } finally {
        setLoading(false);
      }
    };

    if (selector.user?.uid) {
      fetchJobs();
    }
  }, [selector.user?.uid, currentPage, selectedFilter]);

  const handleDeleteClick = (job) => {
    // Check if user is an employer
    if (selector.userType !== "Employer") {
      errorToast("Only employers can delete job postings");
      return;
    }

    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setDeletingJobId(jobToDelete.id);
      const result = await deleteJob(jobToDelete.id, selector.user?.uid);

      if (result.success) {
        // Remove the job from the local state
        setJobs((prevJobs) =>
          prevJobs.filter((job) => job.id !== jobToDelete.id),
        );
        successToast(`Job deleted successfully`);
        setShowDeleteModal(false);
        setJobToDelete(null);
      } else {
        errorToast(result.error || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      errorToast("An unexpected error occurred while deleting the job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
    setDeletingJobId(null);
  };

  if (loading) {
    return <ManageJobsSkeleton />;
  }

  return (
    <>
      <div className="tabs-box">
        <div className="widget-title">
          <h4>My Job Listings</h4>

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
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
              <option value="16">Last 16 Months</option>
              <option value="24">Last 24 Months</option>
              <option value="60">Last 5 years</option>
            </select>
          </div>
        </div>
        {/* End filter top bar */}

        {/* Start table widget content */}
        <div className="widget-content">
          <div className="table-outer">
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Job Viewed</th>
                  <th>Job Post Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {jobs?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <p>
                        No job listings found. Create your first job posting!
                      </p>
                    </td>
                  </tr>
                ) : (
                  jobs?.map((item, index) => {
                    const logo = selector.user?.logo ?? item?.logo;
                    const logoSrc = logo
                      ? logo.startsWith("data:image")
                        ? logo
                        : `data:image/jpeg;base64,${logo}`
                      : "/images/resource/company-6.png";
                    return (
                      <tr key={item?.id}>
                        <td>
                          <div className="job-block">
                            <div className="inner-box">
                              <div className="content">
                                <span className="company-logo">
                                  {logo ? (
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
                                  <Link href={`/job-post/${item.id}`}>
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
                        <td className="applied">
                          <p>{item?.viewCount || 0}</p>
                        </td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="status">
                          {item.status === "archived" ? (
                            <span className="badge bg-secondary">Archived</span>
                          ) : item?.isOpen === "False" ? (
                            "Expired"
                          ) : (
                            "Active"
                          )}
                        </td>
                        <td>
                          <div className="option-box">
                            <ul className="option-list">
                              <li>
                                <button
                                  onClick={() => {
                                    push("/employers-dashboard/all-applicants");
                                  }}
                                  data-text="View Applicants"
                                >
                                  <span className="la la-eye"></span>
                                </button>
                              </li>

                              <li>
                                <button
                                  data-text="Delete Post"
                                  onClick={() => handleDeleteClick(item)}
                                  disabled={deletingJobId === item.id}
                                  style={{
                                    opacity:
                                      deletingJobId === item.id ? 0.6 : 1,
                                    cursor:
                                      deletingJobId === item.id
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                >
                                  <span className="la la-trash"></span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* End table widget content */}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deletingJobId === jobToDelete?.id}
      />

      {/* Pagination Controls */}
      {totalJobs > jobsPerPage && (
        <div
          className="pagination-controls"
          style={{
            marginTop: 30,
            padding: "20px 0",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {/* Results Info */}
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "5px",
            }}
          >
            Showing{" "}
            <span style={{ color: "#374151", fontWeight: "600" }}>
              {(currentPage - 1) * jobsPerPage + 1}
            </span>{" "}
            to{" "}
            <span style={{ color: "#374151", fontWeight: "600" }}>
              {Math.min(currentPage * jobsPerPage, totalJobs)}
            </span>{" "}
            of{" "}
            <span style={{ color: "#374151", fontWeight: "600" }}>
              {totalJobs}
            </span>{" "}
            jobs
          </div>

          {/* Pagination Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Previous Button */}
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

            {/* Page Numbers */}
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    backgroundColor:
                      currentPage === i + 1 ? "#0074E1" : "#ffffff",
                    color: currentPage === i + 1 ? "#ffffff" : "#374151",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: currentPage === i + 1 ? "600" : "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minWidth: "36px",
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
            </div>

            {/* Next Button */}
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
        </div>
      )}
    </>
  );
};

export default JobListingsTable;
