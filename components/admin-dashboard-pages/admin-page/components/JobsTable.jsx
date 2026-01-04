import React, { useEffect, useState, useRef, useMemo } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { debounce } from "@/utils/constants";
import { errorToast } from "@/utils/toast";
import styles from "./admin-tables.module.scss";

const PAGE_SIZE = 10;

export default function JobsTable() {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store all fetched jobs for filtering
  const [jobsLoading, setJobsLoading] = useState(false);
  const [employersMap, setEmployersMap] = useState({});
  const [jobSearch, setJobSearch] = useState("");
  const [jobSearchInput, setJobSearchInput] = useState("");
  const [jobPageStack, setJobPageStack] = useState([]);
  const [jobFirstDoc, setJobFirstDoc] = useState(null);
  const [jobLastDoc, setJobLastDoc] = useState(null);
  const [jobHasNext, setJobHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, expired, archived

  useEffect(() => {
    debounceRef.current = debounce((val) => setJobSearch(val), 500);
  }, []);

  // Fetch jobs and employers for jobs table with pagination and search
  const fetchJobsAndEmployers = async (direction = null, startDoc = null) => {
    setJobsLoading(true);
    try {
      let constraints = [orderBy(sortBy, sortDir), limit(PAGE_SIZE + 1)];

      // Apply server-side search if possible
      if (jobSearch && sortBy === "title") {
        // For title search, we can use range queries
        constraints.unshift(where("title", ">=", jobSearch.toLowerCase()));
        constraints.unshift(
          where("title", "<=", jobSearch.toLowerCase() + "\uf8ff")
        );
      }

      if (startDoc) {
        constraints.push(startAfter(startDoc));
      }

      const jobsQuery = query(collection(db, "jobs"), ...constraints);
      const jobsSnap = await getDocs(jobsQuery);
      let docs = jobsSnap.docs;

      setJobHasNext(docs.length > PAGE_SIZE);
      if (docs.length > PAGE_SIZE) {
        docs = docs.slice(0, PAGE_SIZE);
      }

      let jobsList = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Only apply client-side filtering for cases where server-side search isn't possible
      if (jobSearch && sortBy !== "title") {
        jobsList = jobsList.filter(
          (job) =>
            (job.title &&
              job.title.toLowerCase().includes(jobSearch.toLowerCase())) ||
            (job.employerId &&
              employersMap[job.employerId] &&
              ((employersMap[job.employerId].name &&
                employersMap[job.employerId].name
                  .toLowerCase()
                  .includes(jobSearch.toLowerCase())) ||
                (employersMap[job.employerId].email &&
                  employersMap[job.employerId].email
                    .toLowerCase()
                    .includes(jobSearch.toLowerCase()))))
        );
      }

      setAllJobs(jobsList);
      setJobs(jobsList);
      setJobFirstDoc(docs[0]);
      setJobLastDoc(docs[docs.length - 1]);

      // Update pagination info only when navigating
      if (direction === "next") {
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
      // If direction is null (initial load), don't change the page number

      // Fetch employers for this page
      const employerIds = Array.from(
        new Set(jobsList.map((job) => job.employerId).filter(Boolean))
      );
      if (employerIds.length > 0) {
        let employers = {};
        for (let i = 0; i < employerIds.length; i += 10) {
          const batch = employerIds.slice(i, i + 10);
          const q = query(
            collection(db, "users"),
            where("userType", "==", "Employer"),
            where("__name__", "in", batch)
          );
          const snap = await getDocs(q);
          snap.docs.forEach((doc) => {
            employers[doc.id] = doc.data();
          });
        }
        setEmployersMap((prev) => ({ ...prev, ...employers }));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      errorToast("Error loading jobs");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    setJobPageStack([]);
    setCurrentPage(1);
    fetchJobsAndEmployers();
    // eslint-disable-next-line
  }, [jobSearch, sortBy, sortDir]);

  // Helper function to get job status
  const getJobStatus = (job) => {
    if (job.status === "archived") {
      return "archived";
    } else if (job?.isOpen === "False") {
      return "expired";
    } else {
      return "active";
    }
  };

  // Filter jobs based on status filter
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (statusFilter === "all") return true;
      return getJobStatus(job) === statusFilter;
    });
  }, [statusFilter, allJobs]);

  // Update displayed jobs when filter changes
  useEffect(() => {
    setJobs(filteredJobs);
  }, [filteredJobs]);

  // Count jobs by status (from allJobs)
  const statusCounts = useMemo(() => {
    const counts = {
      all: allJobs.length,
      active: 0,
      expired: 0,
      archived: 0,
    };
    allJobs.forEach((job) => {
      const status = getJobStatus(job);
      counts[status]++;
    });
    return counts;
  }, [allJobs]);

  const handleJobNext = () => {
    setJobPageStack((prev) => [...prev, jobFirstDoc]);
    fetchJobsAndEmployers("next", jobLastDoc);
  };

  const handleJobPrev = () => {
    const prevStack = [...jobPageStack];
    const prevDoc = prevStack.pop();
    setJobPageStack(prevStack);
    fetchJobsAndEmployers("prev", prevDoc);
  };

  const handleJobSearchChange = (e) => {
    setJobSearchInput(e.target.value);
    debounceRef.current(e.target.value);
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <div className={styles["admin-table-container"]} style={{ marginTop: 48 }}>
      <h2 className={styles["admin-table-title"]}>Jobs</h2>
      <div
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          type="text"
          placeholder="Search by job title or employer..."
          value={jobSearchInput}
          onChange={handleJobSearchChange}
          className={styles["admin-table-input"]}
          style={{ flex: "1", minWidth: "200px" }}
        />
        <button
          onClick={() => setStatusFilter("all")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "all" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor: statusFilter === "all" ? "#1967d2" : "#f5f5f5",
            color: statusFilter === "all" ? "white" : "#666",
          }}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "active" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor: statusFilter === "active" ? "#fa5508" : "#f5f5f5",
            color: statusFilter === "active" ? "white" : "#666",
          }}
        >
          Active ({statusCounts.active})
        </button>
        <button
          onClick={() => setStatusFilter("expired")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "expired" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor: statusFilter === "expired" ? "#ef4444" : "#f5f5f5",
            color: statusFilter === "expired" ? "white" : "#666",
          }}
        >
          Expired ({statusCounts.expired})
        </button>
        <button
          onClick={() => setStatusFilter("archived")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "archived" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor: statusFilter === "archived" ? "#888" : "#f5f5f5",
            color: statusFilter === "archived" ? "white" : "#666",
          }}
        >
          Archived ({statusCounts.archived})
        </button>
      </div>
      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("title")}
              style={{ cursor: "pointer" }}
            >
              Title {sortBy === "title" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("createdAt")}
              style={{ cursor: "pointer" }}
            >
              Post Date{" "}
              {sortBy === "createdAt" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("employerId")}
              style={{ cursor: "pointer" }}
            >
              Posted By{" "}
              {sortBy === "employerId" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("viewCount")}
              style={{ cursor: "pointer" }}
            >
              Job Views{" "}
              {sortBy === "viewCount" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobsLoading ? (
            <tr>
              <td colSpan={5} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles["admin-table-empty"]}>
                No jobs found.
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const employer = employersMap[job.employerId];
              const getJobStatusDisplay = () => {
                const status = getJobStatus(job);
                if (status === "archived") {
                  return <span className={styles.chip}>Archived</span>;
                } else if (status === "expired") {
                  return (
                    <span
                      className={`${styles.chip} ${styles["chip-rejected"]}`}
                    >
                      Expired
                    </span>
                  );
                } else {
                  return (
                    <span className={`${styles.chip} ${styles["chip-active"]}`}>
                      Active
                    </span>
                  );
                }
              };
              return (
                <tr key={job.id}>
                  <td>{job.title || "-"}</td>
                  <td>
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {employer
                      ? employer.name || employer.email || employer.id
                      : job.employerId || "-"}
                  </td>
                  <td>
                    {typeof job.viewCount === "number" ? job.viewCount : 0}
                  </td>
                  <td>{getJobStatusDisplay()}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className={styles["admin-table-actions"]}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleJobPrev}
            disabled={jobPageStack.length === 0 || jobsLoading}
            className={styles["admin-table-btn"]}
          >
            Previous
          </button>

          <span style={{ fontSize: "14px", color: "#666" }}>
            Page {currentPage}
            {jobs.length > 0 && (
              <span style={{ marginLeft: "8px" }}>
                (Showing {jobs.length} results)
              </span>
            )}
          </span>

          <button
            onClick={handleJobNext}
            disabled={!jobHasNext || jobsLoading}
            className={styles["admin-table-btn"]}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
