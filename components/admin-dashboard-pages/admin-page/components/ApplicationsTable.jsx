import React, { useEffect, useState, useRef } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { debounce } from "@/utils/constants";
import { errorToast } from "@/utils/toast";
import styles from "./admin-tables.module.scss";

const PAGE_SIZE = 10;

export default function ApplicationsTable() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageStack, setPageStack] = useState([]);
  const [firstDoc, setFirstDoc] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef();

  useEffect(() => {
    debounceRef.current = debounce((val) => setSearch(val), 500);
  }, []);

  const fetchApplications = async (direction = null, startDocArg = null) => {
    setLoading(true);
    try {
      let constraints = [orderBy("appliedAt", "desc"), limit(PAGE_SIZE + 1)];

      if (startDocArg) {
        constraints.push(startAfter(startDocArg));
      }

      const appsQuery = query(collection(db, "applications"), ...constraints);
      const appsSnap = await getDocs(appsQuery);
      let docs = appsSnap.docs;

      setHasNext(docs.length > PAGE_SIZE);
      if (docs.length > PAGE_SIZE) {
        docs = docs.slice(0, PAGE_SIZE);
      }

      let appsList = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Fetch candidate and job info for each application
      const candidateIds = Array.from(
        new Set(appsList.map((a) => a.candidateId).filter(Boolean))
      );
      const jobIds = Array.from(
        new Set(appsList.map((a) => a.jobId).filter(Boolean))
      );
      let candidatesMap = {};
      let jobsMap = {};

      // Batch fetch candidates
      for (let i = 0; i < candidateIds.length; i += 10) {
        const batch = candidateIds.slice(i, i + 10);
        const q = query(collection(db, "users"));
        const snap = await getDocs(q);
        snap.docs.forEach((doc) => {
          if (batch.includes(doc.id)) candidatesMap[doc.id] = doc.data();
        });
      }

      // Batch fetch jobs
      for (let i = 0; i < jobIds.length; i += 10) {
        const batch = jobIds.slice(i, i + 10);
        const q = query(collection(db, "jobs"));
        const snap = await getDocs(q);
        snap.docs.forEach((doc) => {
          if (batch.includes(doc.id)) jobsMap[doc.id] = doc.data();
        });
      }

      // Attach candidate and job info
      appsList = appsList.map((app) => ({
        ...app,
        candidate: candidatesMap[app.candidateId] || {},
        job: jobsMap[app.jobId] || {},
      }));

      // Client-side search filter (since we need to search across joined data)
      if (search) {
        const s = search.toLowerCase();
        appsList = appsList.filter(
          (a) =>
            (a.candidate.name && a.candidate.name.toLowerCase().includes(s)) ||
            (a.candidate.email &&
              a.candidate.email.toLowerCase().includes(s)) ||
            (a.job.title && a.job.title.toLowerCase().includes(s))
        );
      }

      setApplications(appsList);
      setFirstDoc(docs[0]);
      setLastDoc(docs[docs.length - 1]);

      // Update pagination info only when navigating
      if (direction === "next") {
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
      // If direction is null (initial load), don't change the page number
    } catch (error) {
      console.error("Error fetching applications:", error);
      errorToast("Error loading applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageStack([]);
    setCurrentPage(1);
    fetchApplications();
    // eslint-disable-next-line
  }, [search]);

  const handleNext = () => {
    setPageStack((prev) => [...prev, firstDoc]);
    fetchApplications("next", lastDoc);
  };

  const handlePrev = () => {
    const prevStack = [...pageStack];
    const prevDoc = prevStack.pop();
    setPageStack(prevStack);
    fetchApplications("prev", prevDoc);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debounceRef.current(e.target.value);
  };

  return (
    <div className={styles["admin-table-container"]} style={{ marginTop: 48 }}>
      <h2 className={styles["admin-table-title"]}>Applications</h2>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by candidate, email, or job title..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles["admin-table-input"]}
        />
      </div>
      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Candidate Email</th>
            <th>Job Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : applications.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles["admin-table-empty"]}>
                No applications found.
              </td>
            </tr>
          ) : (
            applications.map((app) => (
              <tr key={app.id}>
                <td>{app.candidate.name || "-"}</td>
                <td>{app.candidate.email || "-"}</td>
                <td>{app.job.title || "-"}</td>
                <td>
                  {app.status === "Accepted" && (
                    <span
                      className={`${styles.chip} ${styles["chip-approved"]}`}
                    >
                      Approved
                    </span>
                  )}
                  {app.status === "Rejected" && (
                    <span
                      className={`${styles.chip} ${styles["chip-rejected"]}`}
                    >
                      Rejected
                    </span>
                  )}
                  {app.status === "Active" && (
                    <span className={`${styles.chip} ${styles["chip-active"]}`}>
                      Active
                    </span>
                  )}
                  {!["Accepted", "Rejected", "Active"].includes(app.status) && (
                    <span className={styles.chip}>{app.status || "-"}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className={styles["admin-table-actions"]}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handlePrev}
            disabled={pageStack.length === 0 || loading}
            className={styles["admin-table-btn"]}
          >
            Previous
          </button>

          <span style={{ fontSize: "14px", color: "#666" }}>
            Page {currentPage}
            {applications.length > 0 && (
              <span style={{ marginLeft: "8px" }}>
                (Showing {applications.length} results)
              </span>
            )}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasNext || loading}
            className={styles["admin-table-btn"]}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
