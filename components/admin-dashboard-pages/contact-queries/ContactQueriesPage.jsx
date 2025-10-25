"use client";
import React, { useEffect, useState } from "react";
import { errorToast, successToast } from "@/utils/toast";
import { auth } from "@/utils/firebase";

export default function ContactQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, resolved
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    // Filter by status
    if (statusFilter !== "all" && query.status !== statusFilter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        query.name.toLowerCase().includes(search) ||
        query.email.toLowerCase().includes(search) ||
        query.subject.toLowerCase().includes(search) ||
        query.message.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const toggleExpandRow = (queryId) => {
    setExpandedRow(expandedRow === queryId ? null : queryId);
  };

  const pendingCount = queries.filter((q) => q.status === "pending").length;
  const resolvedCount = queries.filter((q) => q.status === "resolved").length;

  return (
    <div className="widget-content">
      {/* Filter Buttons */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setStatusFilter("all")}
          className="btn"
          style={{
            backgroundColor: statusFilter === "all" ? "#1967d2" : "#f0f5f7",
            color: statusFilter === "all" ? "white" : "#696969",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          All ({queries.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className="btn"
          style={{
            backgroundColor: statusFilter === "pending" ? "#f59e0b" : "#f0f5f7",
            color: statusFilter === "pending" ? "white" : "#696969",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("resolved")}
          className="btn"
          style={{
            backgroundColor:
              statusFilter === "resolved" ? "#10b981" : "#f0f5f7",
            color: statusFilter === "resolved" ? "white" : "#696969",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Resolved ({resolvedCount})
        </button>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            border: "1px solid #e0e6f7",
            borderRadius: "8px",
            fontSize: "14px",
            minWidth: "250px",
          }}
        />

        <button
          onClick={fetchQueries}
          className="btn"
          style={{
            backgroundColor: "#f0f5f7",
            color: "#696969",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Queries List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#696969",
            fontSize: "16px",
          }}
        >
          No contact queries found.
        </div>
      ) : (
        <div className="table-outer">
          <table className="default-table manage-job-table">
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
              {filteredQueries.map((query) => (
                <React.Fragment key={query.id}>
                  <tr
                    onClick={() => toggleExpandRow(query.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <h6>{query.name}</h6>
                    </td>
                    <td>{query.email}</td>
                    <td>{query.subject}</td>
                    <td style={{ fontSize: "14px" }}>
                      {formatDate(query.createdAt)}
                    </td>
                    <td>
                      {query.status === "pending" ? (
                        <span
                          className="status"
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          Pending
                        </span>
                      ) : (
                        <span
                          className="status"
                          style={{
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          Resolved
                        </span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div
                        className="option-box"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        {query.status === "pending" ? (
                          <button
                            onClick={() =>
                              handleStatusUpdate(query.id, "resolved")
                            }
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusUpdate(query.id, "pending")
                            }
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#f59e0b",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            Mark Pending
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(query.id)}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
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
                          padding: "20px",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              marginBottom: 12,
                              fontSize: "15px",
                              color: "#202124",
                            }}
                          >
                            Message:
                          </strong>
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              padding: "16px",
                              backgroundColor: "white",
                              borderRadius: "8px",
                              border: "1px solid #e0e6f7",
                              fontSize: "14px",
                              color: "#696969",
                              lineHeight: "1.6",
                            }}
                          >
                            {query.message}
                          </div>
                          {query.status === "resolved" && query.resolvedAt && (
                            <div
                              style={{
                                marginTop: 12,
                                fontSize: "13px",
                                color: "#696969",
                              }}
                            >
                              <strong>Resolved at:</strong>{" "}
                              {formatDate(query.resolvedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
