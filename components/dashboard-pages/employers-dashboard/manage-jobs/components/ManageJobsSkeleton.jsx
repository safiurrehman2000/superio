import React from "react";

const ManageJobsSkeleton = () => {
  return (
    <>
      <style jsx>{`
        .skeleton {
          background: #e2e2e2;
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
            #f5f5f5 50%,
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
      <div className="tabs-box">
        <div className="widget-title">
          <div
            className="skeleton shimmer"
            style={{ width: 180, height: 28, marginBottom: 16 }}
          />
          <div
            className="skeleton shimmer"
            style={{ width: 160, height: 32, borderRadius: 8 }}
          />
        </div>
        <div className="widget-content">
          <div className="table-outer">
            <table
              className="default-table manage-job-table"
              style={{ minWidth: 400 }}
            >
              <thead>
                <tr>
                  {[
                    "Title",
                    "Job Viewed",
                    "Job Post Date",
                    "Status",
                    "Action",
                  ].map((h, i) => (
                    <th key={i}>
                      <div
                        className="skeleton shimmer"
                        style={{ width: 80, height: 16 }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, r) => (
                  <tr key={r}>
                    {/* Title cell with logo and text */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          className="skeleton shimmer"
                          style={{ width: 50, height: 50, borderRadius: "50%" }}
                        />
                        <div>
                          <div
                            className="skeleton shimmer"
                            style={{ width: 120, height: 18, marginBottom: 8 }}
                          />
                          <div
                            className="skeleton shimmer"
                            style={{ width: 80, height: 14 }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Job Viewed */}
                    <td>
                      <div
                        className="skeleton shimmer"
                        style={{ width: 40, height: 14, borderRadius: 4 }}
                      />
                    </td>
                    {/* Job Post Date */}
                    <td>
                      <div
                        className="skeleton shimmer"
                        style={{ width: 70, height: 14, borderRadius: 4 }}
                      />
                    </td>
                    {/* Status */}
                    <td>
                      <div
                        className="skeleton shimmer"
                        style={{ width: 60, height: 18, borderRadius: 8 }}
                      />
                    </td>
                    {/* Action */}
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span
                          className="skeleton shimmer"
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                        <span
                          className="skeleton shimmer"
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageJobsSkeleton;
