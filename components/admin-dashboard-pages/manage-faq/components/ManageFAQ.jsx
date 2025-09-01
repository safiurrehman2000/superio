"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { getCurrentUserToken } from "@/utils/auth-utils";
import { errorToast, successToast } from "@/utils/toast";
import styles from "../../admin-page/components/admin-tables.module.scss";

const ManageFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newFaq, setNewFaq] = useState({
    heading: "",
    content: "",
    category: "",
  });
  const [editFaq, setEditFaq] = useState({
    heading: "",
    content: "",
    category: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const router = useRouter();

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/faqs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      errorToast("Error fetching FAQs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      errorToast("Error fetching categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      errorToast("Please enter a category name");
      return;
    }

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        setNewCategory("");
        successToast("Category added successfully!");
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      errorToast("Error adding category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? FAQs in this category will be affected."
      )
    ) {
      return;
    }

    try {
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        successToast("Category deleted successfully!");
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      errorToast("Error deleting category");
    }
  };

  const handleAddFAQ = async () => {
    if (!newFaq.heading.trim() || !newFaq.content.trim() || !newFaq.category) {
      errorToast("Please fill in heading, content, and select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFaq),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs([...faqs, data.faq]);
        setNewFaq({ heading: "", content: "", category: "" });
        setIsAdding(false);
        successToast("FAQ added successfully!");
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to add FAQ");
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      errorToast("Error adding FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFAQ = async (id) => {
    if (
      !editFaq.heading.trim() ||
      !editFaq.content.trim() ||
      !editFaq.category
    ) {
      errorToast("Please fill in heading, content, and select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFaq),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(faqs.map((faq) => (faq.id === id ? data.faq : faq)));
        setEditingId(null);
        setEditFaq({ heading: "", content: "", category: "" });
        successToast("FAQ updated successfully!");
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to update FAQ");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      errorToast("Error updating FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const token = await getCurrentUserToken();

      if (!token) {
        errorToast("Authentication required");
        return;
      }

      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFaqs(faqs.filter((faq) => faq.id !== id));
        successToast("FAQ deleted successfully!");
      } else {
        const errorData = await response.json();
        errorToast(errorData.error || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      errorToast("Error deleting FAQ");
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditing = (faq) => {
    console.log("🔍 Starting edit for FAQ:", faq);
    console.log("🔍 FAQ object keys:", Object.keys(faq));
    console.log("🔍 FAQ object values:", Object.values(faq));

    // Ensure we have the data, with fallbacks
    const heading = faq.heading || faq.title || faq.question || "";
    const content = faq.content || faq.answer || faq.body || "";
    const category = faq.category || "";

    console.log("✅ Using heading:", heading);
    console.log("✅ Using content:", content);
    console.log("✅ Using category:", category);

    setEditingId(faq.id);
    setEditFaq({ heading, content, category });

    console.log("✅ Set editingId to:", faq.id);
    console.log("✅ Set editFaq to:", { heading, content, category });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFaq({ heading: "", content: "", category: "" });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewFaq({ heading: "", content: "", category: "" });
  };

  if (loading) {
    return (
      <div className={styles["admin-table-container"]}>
        <h2 className={styles["admin-table-title"]}>Manage FAQ</h2>
        <div className={styles["admin-table-loading"]}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles["admin-table-container"]}>
      <h2 className={styles["admin-table-title"]}>Manage FAQ</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Add, edit, and manage frequently asked questions for your website.
      </p>

      {/* Category Manager */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>Categories</h3>
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className={styles["admin-table-btn"]}
            style={{
              backgroundColor: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {showCategoryManager ? "Hide" : "Manage"} Categories
          </button>
        </div>

        {showCategoryManager && (
          <div
            style={{
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              backgroundColor: "#f9fafb",
            }}
          >
            {/* Add New Category */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={styles["admin-table-input"]}
                placeholder="Enter category name"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddCategory}
                className={styles["admin-table-btn"]}
                style={{
                  backgroundColor: "#059669",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaPlus />
                Add Category
              </button>
            </div>

            {/* Categories List */}
            <div>
              <h4
                style={{
                  marginBottom: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                Current Categories:
              </h4>
              {categories.length === 0 ? (
                <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                  No categories created yet.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>{category.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className={styles["admin-table-btn"]}
                        style={{
                          backgroundColor: "transparent",
                          color: "#dc2626",
                          border: "1px solid #dc2626",
                          padding: "6px 12px",
                          fontSize: "0.875rem",
                        }}
                        title="Delete Category"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New FAQ Button */}
      {!isAdding && (
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setIsAdding(true)}
            className={styles["admin-table-btn"]}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FaPlus />
            Add New FAQ
          </button>
        </div>
      )}

      {/* Add New FAQ Form */}
      {isAdding && (
        <div
          style={{
            marginBottom: "24px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            backgroundColor: "#f9fafb",
          }}
        >
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            Add New FAQ
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Heading
              </label>
              <input
                type="text"
                value={newFaq.heading}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, heading: e.target.value })
                }
                className={styles["admin-table-input"]}
                placeholder="Enter FAQ heading"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Content
              </label>
              <textarea
                rows={4}
                value={newFaq.content}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, content: e.target.value })
                }
                className={styles["admin-table-input"]}
                placeholder="Enter FAQ content"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <div>
              <label htmlFor="new-category" className="form-label">
                Category
              </label>
              <select
                id="new-category"
                value={newFaq.category}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, category: e.target.value })
                }
                className={styles["admin-table-input"]}
                style={{ width: "100%" }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleAddFAQ}
                className={styles["admin-table-btn"]}
                style={{
                  backgroundColor: "#059669",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save FAQ
                  </>
                )}
              </button>
              <button
                onClick={cancelAdding}
                className={styles["admin-table-btn"]}
                style={{
                  backgroundColor: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "1.2rem",
            fontWeight: "600",
          }}
        >
          Current FAQs ({faqs.length})
        </h3>

        {faqs.length === 0 ? (
          <div className={styles["admin-table-empty"]}>
            No FAQs found. Add your first FAQ to get started.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  backgroundColor: "#fff",
                }}
              >
                {editingId === faq.id ? (
                  // Edit Mode
                  <div
                    style={{
                      border: "2px solid #2563eb",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#f0f9ff",
                    }}
                  >
                    <h4
                      style={{
                        marginBottom: "16px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      ✏️ Edit FAQ #{index + 1} (ID: {faq.id})
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                          }}
                        >
                          Heading
                        </label>
                        <input
                          type="text"
                          value={editFaq.heading}
                          onChange={(e) =>
                            setEditFaq({ ...editFaq, heading: e.target.value })
                          }
                          className={styles["admin-table-input"]}
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                          }}
                        >
                          Content
                        </label>
                        <textarea
                          rows={4}
                          value={editFaq.content}
                          onChange={(e) =>
                            setEditFaq({ ...editFaq, content: e.target.value })
                          }
                          className={styles["admin-table-input"]}
                          style={{ width: "100%", resize: "vertical" }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                          }}
                        >
                          Category
                        </label>
                        <select
                          value={editFaq.category}
                          onChange={(e) =>
                            setEditFaq({ ...editFaq, category: e.target.value })
                          }
                          className={styles["admin-table-input"]}
                          style={{ width: "100%" }}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => handleEditFAQ(faq.id)}
                          className={styles["admin-table-btn"]}
                          style={{
                            backgroundColor: "#059669",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className={styles["admin-table-btn"]}
                          style={{
                            backgroundColor: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          marginBottom: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#2563eb",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                          }}
                        >
                          {index + 1}
                        </span>
                        {faq.heading}
                      </h4>
                      {faq.category && (
                        <div style={{ marginBottom: "8px" }}>
                          <span
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                            }}
                          >
                            {categories.find((cat) => cat.id === faq.category)
                              ?.name || "Unknown Category"}
                          </span>
                        </div>
                      )}
                      <p
                        style={{
                          color: "#4b5563",
                          marginBottom: "12px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {faq.content}
                      </p>
                      <small style={{ color: "#9ca3af" }}>
                        Last updated:{" "}
                        {new Date(
                          faq.updatedAt || faq.createdAt
                        ).toLocaleDateString()}
                      </small>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginLeft: "16px",
                      }}
                    >
                      <button
                        onClick={() => startEditing(faq)}
                        className={styles["admin-table-btn"]}
                        style={{
                          backgroundColor: "transparent",
                          color: "#2563eb",
                          border: "1px solid #2563eb",
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                        }}
                        title="Edit FAQ"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className={styles["admin-table-btn"]}
                        style={{
                          backgroundColor: "transparent",
                          color: "#dc2626",
                          border: "1px solid #dc2626",
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                        }}
                        title="Delete FAQ"
                        disabled={isDeleting === faq.id}
                      >
                        {isDeleting === faq.id ? (
                          <svg
                            className="animate-spin h-5 w-5 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFAQ;
