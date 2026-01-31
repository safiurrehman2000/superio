import React from "react";
import "@/styles/customStyles.css";

const skeletonClass = "admin-skeleton-base admin-skeleton-shimmer";

const tableSkeleton = (headers, rows = 5, cols = 3) => (
  <div style={{ marginBottom: 48 }}>
    <div
      style={{ height: 24, width: 180, marginBottom: 16 }}
      className={skeletonClass}
    />
    <div style={{ overflowX: "auto" }}>
      <table
        className="admin-skeleton-table"
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          background: "#fafbfc",
          borderRadius: 12,
          minWidth: 400,
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  background: "#f3f4f6",
                  fontWeight: 700,
                  padding: "14px 16px",
                }}
              >
                <div
                  className={skeletonClass}
                  style={{ width: 80, height: 16 }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: "14px 16px" }}>
                  <div
                    className={skeletonClass}
                    style={{ width: "80%", height: 14, borderRadius: 4 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminSkeleton = () => {
  return (
    <div style={{ width: "100%" }}>
        {/* Users Table Skeleton */}
        {tableSkeleton(["Email", "Name", "Mobile", "User Type"], 4, 4)}
        {/* Jobs Table Skeleton */}
        {tableSkeleton(["Title", "Post Date", "Posted By", "Job Views"], 4, 4)}
        {/* Applications Table Skeleton */}
        {tableSkeleton(
          ["Candidate Name", "Candidate Email", "Job Title", "Status"],
          4,
          4
        )}
    </div>
  );
};

export default AdminSkeleton;
