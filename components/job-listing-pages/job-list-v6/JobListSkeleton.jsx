import React from "react";

const JobListSkeleton = ({ count = 4 }) => {
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
      <div className="row">
        {Array.from({ length: count }).map((_, idx) => (
          <div className="job-block col-lg-6 col-md-12 col-sm-12" key={idx}>
            <div className="inner-box hover-effect" style={{ minHeight: 220 }}>
              <div className="content">
                <span
                  className="company-logo skeleton shimmer"
                  style={{
                    display: "inline-block",
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    marginBottom: 12,
                  }}
                />
                <div
                  className="skeleton shimmer"
                  style={{ width: "60%", height: 20, margin: "16px 0 8px 0" }}
                />
                <ul className="job-info" style={{ padding: 0, margin: 0 }}>
                  <li>
                    <span className="icon flaticon-briefcase" />
                    <span
                      className="skeleton shimmer"
                      style={{
                        width: 80,
                        height: 12,
                        display: "inline-block",
                        marginLeft: 8,
                      }}
                    />
                  </li>
                  <li>
                    <span className="icon flaticon-map-locator" />
                    <span
                      className="skeleton shimmer"
                      style={{
                        width: 60,
                        height: 12,
                        display: "inline-block",
                        marginLeft: 8,
                      }}
                    />
                  </li>
                  <li>
                    <span className="icon flaticon-clock-3" />
                    <span
                      className="skeleton shimmer"
                      style={{
                        width: 50,
                        height: 12,
                        display: "inline-block",
                        marginLeft: 8,
                      }}
                    />
                  </li>
                </ul>
                <ul
                  className="job-other-info"
                  style={{ padding: 0, margin: "12px 0" }}
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li
                      key={i}
                      className="skeleton shimmer"
                      style={{
                        width: 40,
                        height: 14,
                        display: "inline-block",
                        marginRight: 8,
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </ul>
                <button
                  className="bookmark-btn skeleton shimmer"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "none",
                  }}
                  disabled
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default JobListSkeleton;
