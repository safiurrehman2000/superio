import React, { useEffect, useState } from "react";
import { errorToast, successToast } from "@/utils/toast";
import styles from "./admin-tables.module.scss";
import { auth } from "@/utils/firebase";

export default function ContactQueriesTable() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, resolved
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        errorToast("You must be logged in as an admin");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/contact-queries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contact queries");
      }

      const data = await response.json();
      if (data.success) {
        setQueries(data.queries);
      } else {
        errorToast(data.error || "Failed to load contact queries");
      }
    } catch (error) {
      console.error("Error fetching contact queries:", error);
      errorToast("Error loading contact queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        errorToast("You must be logged in as an admin");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/contact-queries/${queryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        successToast(`Query marked as ${newStatus}`);
        fetchQueries(); // Refresh the list
      } else {
        errorToast(data.error || "Failed to update query status");
      }
    } catch (error) {
      console.error("Error updating query status:", error);
      errorToast("Error updating query status");
    }
  };

  const handleDelete = async (queryId) => {
    if (!confirm("Are you sure you want to delete this contact query?")) {
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        errorToast("You must be logged in as an admin");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/contact-queries/${queryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        successToast("Query deleted successfully");
        fetchQueries(); // Refresh the list
      } else {
        errorToast(data.error || "Failed to delete query");
      }
    } catch (error) {
      console.error("Error deleting query:", error);
      errorToast("Error deleting query");
    }
  };

  const filteredQueries = queries.filter((query) => {
    if (statusFilter === "all") return true;
    return query.status === statusFilter;
  });

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const toggleExpandRow = (queryId) => {
    setExpandedRow(expandedRow === queryId ? null : queryId);
  };

  return (
    <div className={styles["admin-table-container"]}>
      <h2 className={styles["admin-table-title"]}>Contact Queries</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
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
          All ({queries.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "pending" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor: statusFilter === "pending" ? "#f59e0b" : "#f5f5f5",
            color: statusFilter === "pending" ? "white" : "#666",
          }}
        >
          Pending ({queries.filter((q) => q.status === "pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("resolved")}
          className={`${styles["admin-table-btn"]} ${
            statusFilter === "resolved" ? styles["active"] : ""
          }`}
          style={{
            backgroundColor:
              statusFilter === "resolved" ? "#10b981" : "#f5f5f5",
            color: statusFilter === "resolved" ? "white" : "#666",
          }}
        >
          Resolved ({queries.filter((q) => q.status === "resolved").length})
        </button>
        <button
          onClick={fetchQueries}
          className={styles["admin-table-btn"]}
          style={{ marginLeft: "auto" }}
        >
          Refresh
        </button>
      </div>

      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : filteredQueries.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles["admin-table-empty"]}>
                No contact queries found.
              </td>
            </tr>
          ) : (
            filteredQueries.map((query) => (
              <React.Fragment key={query.id}>
                <tr
                  onClick={() => toggleExpandRow(query.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{query.name}</td>
                  <td>{query.email}</td>
                  <td>{query.subject}</td>
                  <td style={{ fontSize: "0.875rem" }}>
                    {formatDate(query.createdAt)}
                  </td>
                  <td>
                    {query.status === "pending" ? (
                      <span
                        className={`${styles.chip}`}
                        style={{
                          backgroundColor: "#fef3c7",
                          color: "#92400e",
                        }}
                      >
                        Pending
                      </span>
                    ) : (
                      <span
                        className={`${styles.chip}`}
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                        }}
                      >
                        Resolved
                      </span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {query.status === "pending" ? (
                        <button
                          onClick={() =>
                            handleStatusUpdate(query.id, "resolved")
                          }
                          className={styles["admin-table-btn"]}
                          style={{
                            backgroundColor: "#10b981",
                            color: "white",
                            fontSize: "0.875rem",
                            padding: "4px 12px",
                          }}
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusUpdate(query.id, "pending")
                          }
                          className={styles["admin-table-btn"]}
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "white",
                            fontSize: "0.875rem",
                            padding: "4px 12px",
                          }}
                        >
                          Mark Pending
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(query.id)}
                        className={styles["admin-table-btn"]}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          fontSize: "0.875rem",
                          padding: "4px 12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === query.id && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                      }}
                    >
                      <div>
                        <strong style={{ display: "block", marginBottom: 8 }}>
                          Message:
                        </strong>
                        <p
                          style={{
                            whiteSpace: "pre-wrap",
                            margin: 0,
                            padding: "12px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          {query.message}
                        </p>
                        {query.status === "resolved" && query.resolvedAt && (
                          <div
                            style={{
                              marginTop: 12,
                              fontSize: "0.875rem",
                              color: "#666",
                            }}
                          >
                            <strong>Resolved:</strong>{" "}
                            {formatDate(query.resolvedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
