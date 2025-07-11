import React from "react";

const JobSingleSkeleton = () => {
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
      <section className="job-detail-section">
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              {/* Main Content */}
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  <div className="job-block-seven style-two">
                    <div className="inner-box">
                      <div className="content">
                        <div
                          className="skeleton shimmer"
                          style={{
                            width: "60%",
                            height: 32,
                            margin: "16px 0 16px 0",
                          }}
                        />
                        <ul
                          className="job-info"
                          style={{ padding: 0, margin: 0 }}
                        >
                          {Array.from({ length: 3 }).map((_, i) => (
                            <li key={i} style={{ marginBottom: 8 }}>
                              <span
                                className="skeleton shimmer"
                                style={{
                                  width: 120,
                                  height: 16,
                                  display: "inline-block",
                                  marginRight: 8,
                                }}
                              />
                            </li>
                          ))}
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
                                width: 48,
                                height: 16,
                                display: "inline-block",
                                marginRight: 8,
                                borderRadius: 4,
                              }}
                            />
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="job-detail">
                  <div
                    className="skeleton shimmer"
                    style={{
                      width: "40%",
                      height: 24,
                      margin: "24px 0 12px 0",
                    }}
                  />
                  <div
                    className="skeleton shimmer"
                    style={{ width: "100%", height: 80, marginBottom: 12 }}
                  />
                  <div
                    className="skeleton shimmer"
                    style={{ width: "90%", height: 16, marginBottom: 8 }}
                  />
                  <div
                    className="skeleton shimmer"
                    style={{ width: "80%", height: 16, marginBottom: 8 }}
                  />
                  <div
                    className="skeleton shimmer"
                    style={{ width: "60%", height: 16, marginBottom: 8 }}
                  />
                </div>
                <div className="other-options" style={{ marginTop: 32 }}>
                  <div className="social-share">
                    <div
                      className="skeleton shimmer"
                      style={{ width: 120, height: 24, marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span
                          key={i}
                          className="skeleton shimmer"
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Sidebar */}
              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div
                    className="btn-box"
                    style={{ display: "flex", gap: 12, marginBottom: 24 }}
                  >
                    <div
                      className="skeleton shimmer"
                      style={{ width: "70%", height: 40, borderRadius: 8 }}
                    />
                    <div
                      className="skeleton shimmer"
                      style={{ width: 40, height: 40, borderRadius: "50%" }}
                    />
                  </div>
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <div
                        className="company-title"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          marginBottom: 16,
                        }}
                      >
                        <span
                          className="company-logo skeleton shimmer"
                          style={{ width: 54, height: 54, borderRadius: "50%" }}
                        />
                        <div>
                          <div
                            className="skeleton shimmer"
                            style={{ width: 100, height: 18, marginBottom: 8 }}
                          />
                          <div
                            className="skeleton shimmer"
                            style={{ width: 80, height: 14 }}
                          />
                        </div>
                      </div>
                      <ul
                        className="company-info"
                        style={{ padding: 0, margin: 0 }}
                      >
                        {Array.from({ length: 4 }).map((_, i) => (
                          <li
                            key={i}
                            className="skeleton shimmer"
                            style={{
                              width: "90%",
                              height: 14,
                              marginBottom: 8,
                              borderRadius: 4,
                            }}
                          />
                        ))}
                      </ul>
                      <div className="btn-box" style={{ marginTop: 16 }}>
                        <div
                          className="skeleton shimmer"
                          style={{ width: "100%", height: 36, borderRadius: 8 }}
                        />
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default JobSingleSkeleton;
