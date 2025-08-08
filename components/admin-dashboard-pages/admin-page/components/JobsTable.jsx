import React, { useEffect, useState, useRef } from "react";
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

const PAGE_SIZE = 5;

export default function JobsTable() {
  const [jobs, setJobs] = useState([]);
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
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by job title or employer..."
          value={jobSearchInput}
          onChange={handleJobSearchChange}
          className={styles["admin-table-input"]}
        />
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
          </tr>
        </thead>
        <tbody>
          {jobsLoading ? (
            <tr>
              <td colSpan={4} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles["admin-table-empty"]}>
                No jobs found.
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const employer = employersMap[job.employerId];
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
