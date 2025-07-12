import React from "react";

const tableSkeleton = (headers, rows = 5, cols = 3) => (
  <div style={{ marginBottom: 48 }}>
    <div
      style={{ height: 24, width: 180, marginBottom: 16 }}
      className="skeleton shimmer"
    />
    <div style={{ overflowX: "auto" }}>
      <table
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
                  className="skeleton shimmer"
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
                    className="skeleton shimmer"
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
    <>
      <style jsx>{`
        .skeleton {
          background: #c7c7c7;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .skeleton.shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150px;
          height: 100%;
          width: 150px;
          background: linear-gradient(
            90deg,
            transparent,
            #e0e0e0 50%,
            transparent
          );
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 100%;
          }
        }
        @media (max-width: 700px) {
          table {
            min-width: 320px !important;
          }
        }
      `}</style>
      <div style={{ width: "100%" }}>
        {/* Users Table Skeleton */}
        {tableSkeleton(["Email", "Name", "User Type"], 4, 3)}
        {/* Jobs Table Skeleton */}
        {tableSkeleton(["Title", "Post Date", "Posted By", "Job Views"], 4, 4)}
        {/* Applications Table Skeleton */}
        {tableSkeleton(
          ["Candidate Name", "Candidate Email", "Job Title", "Status"],
          4,
          4
        )}
      </div>
    </>
  );
};

export default AdminSkeleton;
