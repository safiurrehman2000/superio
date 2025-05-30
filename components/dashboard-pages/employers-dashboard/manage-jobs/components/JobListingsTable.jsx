"use client";
import { useFetchEmployerJobs } from "@/APIs/auth/jobs";
import { formatString } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

const JobListingsTable = async () => {
  const selector = useSelector((store) => store.user);
  const jobs = await useFetchEmployerJobs(selector.user.uid);

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Job Listings</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Job Viewed</th>
                <th>Job Post Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs?.map((item, index) => {
                const logoSrc = item?.logo
                  ? item.logo.startsWith("data:image")
                    ? item.logo
                    : `data:image/jpeg;base64,${item.logo}`
                  : "/images/resource/company-6.png";
                return (
                  <tr key={item?.id}>
                    <td>
                      <div className="job-block">
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              {item?.logo ? (
                                <Image
                                  width={50}
                                  height={49}
                                  src={logoSrc}
                                  alt="company logo"
                                  style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    height: "50px",
                                    width: "50px",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    borderRadius: "50%",
                                    height: "50px",
                                    width: "50px",
                                    backgroundColor:
                                      index % 3 === 0
                                        ? "#FA5508"
                                        : index % 3 === 1
                                        ? "#10E7DC"
                                        : "#0074E1",
                                    textAlign: "center",
                                    alignContent: "center",
                                  }}
                                >
                                  <p style={{ margin: 0, color: "white" }}>
                                    {item?.email?.charAt(0).toUpperCase() +
                                      " " +
                                      item?.email?.charAt(1).toUpperCase()}
                                  </p>
                                </div>
                              )}
                            </span>
                            <h4>
                              <Link href={`/job-post/${item.id}`}>
                                {item?.title}
                              </Link>
                            </h4>
                            <ul className="job-info">
                              <li>
                                <span className="icon flaticon-briefcase"></span>
                                {formatString(item?.jobType)}
                              </li>
                              <li>
                                <span className="icon flaticon-map-locator"></span>
                                {formatString(item?.location)}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="applied">
                      <p>{item?.viewCount}</p>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="status">
                      {item?.isOpen === "False" ? "Expired" : "Active"}
                    </td>
                    <td>
                      <div className="option-box">
                        <ul className="option-list">
                          <li>
                            <button data-text="View Applicants">
                              <span className="la la-eye"></span>
                            </button>
                          </li>

                          <li>
                            <button data-text="Delete Post">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobListingsTable;
