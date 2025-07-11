"use client";
import { useFetchEmployerJobs, deleteJob } from "@/APIs/auth/jobs";
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
  const jobsPerPage = 10;
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState("6"); // default to 6 months

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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const fetchedJobs = await useFetchEmployerJobs(selector.user?.uid);
        setJobs(fetchedJobs || []);
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
  }, [selector.user?.uid]);

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
          prevJobs.filter((job) => job.id !== jobToDelete.id)
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
                  paginatedJobs?.map((item, index) => {
                    const logoSrc = item?.logo
                      ? item.logo.startsWith("data:image")
                        ? item.logo
                        : `data:image/jpeg;base64,${item.logo}`
                      : "/images/resource/company-6.png";
                    return (
                      <tr key={item?.id}>
                        <td>
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
                          {item?.isOpen === "False" ? "Expired" : "Active"}
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
    </>
  );
};

export default JobListingsTable;
