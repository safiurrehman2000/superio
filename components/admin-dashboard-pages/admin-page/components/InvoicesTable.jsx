"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUserToken } from "@/utils/auth-utils";
import { errorToast, successToast } from "@/utils/toast";
import styles from "./admin-tables.module.scss";

export default function InvoicesTable() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    currency: "",
    dateFrom: "",
    dateTo: "",
  });

  const formatInvoiceDate = (created) => {
    if (!created) return "-";

    let dateValue = null;

    if (created instanceof Date) {
      dateValue = created;
    } else if (typeof created === "number") {
      dateValue = new Date(created < 1e12 ? created * 1000 : created);
    } else if (typeof created === "string") {
      const numericValue = Number(created);
      if (!Number.isNaN(numericValue) && created.trim() !== "") {
        dateValue = new Date(
          numericValue < 1e12 ? numericValue * 1000 : numericValue,
        );
      } else {
        dateValue = new Date(created);
      }
    } else if (typeof created === "object") {
      if (typeof created.toDate === "function") {
        dateValue = created.toDate();
      } else if (typeof created.seconds === "number") {
        dateValue = new Date(created.seconds * 1000);
      } else if (typeof created._seconds === "number") {
        dateValue = new Date(created._seconds * 1000);
      }
    }

    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
      return "-";
    }

    return dateValue.toLocaleString();
  };

  const fetchInvoices = async (targetPage = page) => {
    setLoading(true);
    try {
      const token = await getCurrentUserToken();
      const query = new URLSearchParams({
        page: String(targetPage),
        limit: String(limit),
        scanLimit: "200",
      });
      if (filters.search.trim()) query.set("search", filters.search.trim());
      if (filters.currency.trim()) query.set("currency", filters.currency.trim());
      if (filters.dateFrom) query.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) query.set("dateTo", filters.dateTo);

      const response = await fetch(`/api/admin/invoices?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load invoices");
      }
      setInvoices(payload.data || []);
      setPagination(
        payload.pagination || {
          page: 1,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
      setPage(payload?.pagination?.page || targetPage);
    } catch (error) {
      console.error("Error loading invoices:", error);
      errorToast(error.message || "Error loading invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.currency, filters.dateFrom, filters.dateTo]);

  const openReceiptPdf = async (receiptDocId) => {
    setPdfLoadingId(receiptDocId);
    try {
      const token = await getCurrentUserToken();
      const res = await fetch(
        `/api/admin/receipt-pdf?receiptId=${encodeURIComponent(receiptDocId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail || err.error || `Could not open PDF (${res.status})`,
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (error) {
      errorToast(error.message || "Could not open PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleSyncMissingInvoices = async () => {
    setSyncing(true);
    try {
      const token = await getCurrentUserToken();
      const response = await fetch("/api/admin/sync-invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maxInvoices: 300 }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Invoice sync failed");
      }

      const { createdCount, skippedExisting } = payload.stats || {};
      successToast(
        `Invoices synced. Added: ${createdCount ?? 0}, Already existed: ${
          skippedExisting ?? 0
        }`,
      );
      await fetchInvoices(page);
    } catch (error) {
      console.error("Error syncing invoices:", error);
      errorToast(error.message || "Error syncing invoices");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={styles["admin-table-container"]}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <h2 className={styles["admin-table-title"]}>Receipts &amp; invoices</h2>
        <button
          className={styles["admin-table-btn"]}
          disabled={syncing || loading}
          onClick={handleSyncMissingInvoices}
        >
          {syncing ? "Syncing..." : "Sync Missing Stripe Invoices"}
        </button>
      </div>

      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search reference/company/email..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          className={styles["admin-table-input"]}
        />
        <select
          value={filters.currency}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, currency: e.target.value }))
          }
          className={styles["admin-table-input"]}
        >
          <option value="">All currencies</option>
          <option value="eur">EUR</option>
          <option value="usd">USD</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
          }
          className={styles["admin-table-input"]}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
          }
          className={styles["admin-table-input"]}
        />
        <button
          className={styles["admin-table-btn"]}
          onClick={() =>
            setFilters({ search: "", currency: "", dateFrom: "", dateTo: "" })
          }
        >
          Reset Filters
        </button>
      </div>

      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Factuurnr.</th>
            <th>Company</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Date</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles["admin-table-empty"]}>
                No receipts found.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.receiptTypeLabel || "-"}</td>
                <td
                  style={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={invoice.referenceId || ""}
                >
                  {invoice.referenceId || "-"}
                </td>
                <td>{invoice.user?.company_name || "-"}</td>
                <td>{invoice.user?.email || "-"}</td>
                <td>
                  {typeof invoice.amount === "number"
                    ? `${invoice.amount / 100} ${String(
                        invoice.currency || "",
                      ).toUpperCase()}`
                    : "-"}
                </td>
                <td>
                  {formatInvoiceDate(invoice.created)}
                </td>
                <td>
                  {invoice.receipt_pdf_url ? (
                    <a
                      href={invoice.receipt_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fa5508", textDecoration: "underline" }}
                    >
                      Open PDF
                    </a>
                  ) : invoice.referenceId ? (
                    <button
                      type="button"
                      onClick={() => openReceiptPdf(invoice.id)}
                      disabled={pdfLoadingId === invoice.id}
                      style={{
                        color: "#fa5508",
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor:
                          pdfLoadingId === invoice.id ? "wait" : "pointer",
                      }}
                    >
                      {pdfLoadingId === invoice.id ? "Loading…" : "Open PDF"}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles["admin-table-actions"]}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => fetchInvoices(page - 1)}
            disabled={!pagination.hasPrevPage || loading}
            className={styles["admin-table-btn"]}
          >
            Previous
          </button>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Page {pagination.page} of {pagination.totalPages} (Total:{" "}
            {pagination.total})
          </span>
          <button
            onClick={() => fetchInvoices(page + 1)}
            disabled={!pagination.hasNextPage || loading}
            className={styles["admin-table-btn"]}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
