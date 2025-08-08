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

const PAGE_SIZE = 10;

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isCandidateSearch, setIsCandidateSearch] = useState(false);
  const [isEmployerSearch, setIsEmployerSearch] = useState(false);
  const [sortBy, setSortBy] = useState("email");
  const [sortDir, setSortDir] = useState("asc");
  const [hasNext, setHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef();

  useEffect(() => {
    debounceRef.current = debounce((val) => setSearch(val), 500);
  }, []);

  const fetchUsers = async (direction = null, startDoc = null) => {
    setLoading(true);
    try {
      let q = collection(db, "users");
      let constraints = [orderBy(sortBy, sortDir), limit(PAGE_SIZE + 1)];

      // Apply server-side filters
      if (isCandidateSearch) {
        constraints.unshift(where("userType", "==", "Candidate"));
      }
      if (isEmployerSearch) {
        constraints.unshift(where("userType", "==", "Employer"));
      }

      // Apply server-side search if possible
      if (search && sortBy === "email") {
        // For email search, we can use range queries
        constraints.unshift(where("email", ">=", search.toLowerCase()));
        constraints.unshift(
          where("email", "<=", search.toLowerCase() + "\uf8ff")
        );
      } else if (search && sortBy === "name") {
        // For name search, we can use range queries
        constraints.unshift(where("name", ">=", search.toLowerCase()));
        constraints.unshift(
          where("name", "<=", search.toLowerCase() + "\uf8ff")
        );
      }

      if (startDoc) {
        constraints.push(startAfter(startDoc));
      }

      const usersQuery = query(q, ...constraints);
      const snapshot = await getDocs(usersQuery);
      let docs = snapshot.docs;

      setHasNext(docs.length > PAGE_SIZE);
      if (docs.length > PAGE_SIZE) {
        docs = docs.slice(0, PAGE_SIZE);
      }

      let usersList = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Only apply client-side filtering for cases where server-side search isn't possible
      if (search && sortBy !== "email" && sortBy !== "name") {
        usersList = usersList.filter(
          (u) =>
            (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
        );
      }

      setUsers(usersList);
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
      console.error("Error fetching users:", error);
      errorToast("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageStack([]);
    setCurrentPage(1);
    fetchUsers();
    // eslint-disable-next-line
  }, [search, isCandidateSearch, isEmployerSearch, sortBy, sortDir]);

  const handleNext = () => {
    setPageStack((prev) => [...prev, firstDoc]);
    fetchUsers("next", lastDoc);
  };

  const handlePrev = () => {
    const prevStack = [...pageStack];
    const prevDoc = prevStack.pop();
    setPageStack(prevStack);
    fetchUsers("prev", prevDoc);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
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
    <div className={styles["admin-table-container"]}>
      <h2 className={styles["admin-table-title"]}>Registered Users</h2>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles["admin-table-input"]}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={isCandidateSearch}
            onChange={() => setIsCandidateSearch((v) => !v)}
            className={styles["admin-table-checkbox"]}
          />
          Only Candidates
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={isEmployerSearch}
            onChange={() => setIsEmployerSearch((v) => !v)}
            className={styles["admin-table-checkbox"]}
          />
          Only Employers
        </label>
      </div>
      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("email")}
              style={{ cursor: "pointer" }}
            >
              Email {sortBy === "email" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Name {sortBy === "name" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("userType")}
              style={{ cursor: "pointer" }}
            >
              User Type{" "}
              {sortBy === "userType" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={3} className={styles["admin-table-empty"]}>
                No users found.
              </td>
            </tr>
          ) : (
            users?.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name || "-"}</td>
                <td>
                  {user.userType === "Candidate" && (
                    <span
                      className={`${styles.chip} ${styles["chip-candidate"]}`}
                    >
                      Candidate
                    </span>
                  )}
                  {user.userType === "Employer" && (
                    <span
                      className={`${styles.chip} ${styles["chip-employer"]}`}
                    >
                      Employer
                    </span>
                  )}
                  {user.userType === "Admin" && (
                    <span className={`${styles.chip} ${styles["chip-admin"]}`}>
                      Admin
                    </span>
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
            {users.length > 0 && (
              <span style={{ marginLeft: "8px" }}>
                (Showing {users.length} results)
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
