import React from "react";

const AllApplicantsSkeleton = () => {
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
      `}</style>
      {/* Skeleton for widget-title/header */}
      <div className="widget-title" style={{ marginBottom: 24 }}>
        <div
          className="skeleton shimmer"
          style={{ width: 120, height: 28, marginBottom: 12 }}
        />
        <div
          className="skeleton shimmer"
          style={{ width: 180, height: 32, borderRadius: 8 }}
        />
      </div>
      {/* Skeleton for applicants grid */}
      <div className="row">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            className="candidate-block-three col-lg-3 col-md-6 col-sm-12"
            key={idx}
          >
            <div
              className="file-edit-box job-filter"
              style={{ border: "none", borderRadius: 5, gap: 10, padding: 16 }}
            >
              <div className="d-flex flex-column align-items-center">
                <span
                  className="skeleton shimmer"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    marginBottom: 12,
                  }}
                />
                <div
                  className="skeleton shimmer"
                  style={{ width: 80, height: 18, marginBottom: 8 }}
                />
                <div
                  className="skeleton shimmer"
                  style={{ width: 60, height: 14, marginBottom: 8 }}
                />
                <div
                  className="skeleton shimmer"
                  style={{ width: 70, height: 14, marginBottom: 8 }}
                />
                <div
                  className="skeleton shimmer"
                  style={{ width: 50, height: 14, marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 6, margin: "8px 0" }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className="skeleton shimmer"
                      style={{ width: 32, height: 16, borderRadius: 8 }}
                    />
                  ))}
                </div>
              </div>
              <div className="option-box" style={{ marginTop: 12 }}>
                <ul
                  className="option-list"
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <span
                        className="skeleton shimmer"
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllApplicantsSkeleton;
