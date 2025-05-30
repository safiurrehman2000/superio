"use client";
import Link from "next/link.js";
import Image from "next/image.js";
import { useSelector } from "react-redux";
import { formatString } from "@/utils/constants";

const JobListingsTable = () => {
  const selector = useSelector((store) => store.user);
  const jobs = selector?.appliedJobs;

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>

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
          <div className="table-outer">
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {jobs?.map((item) => {
                  const logoSrc = item?.logo
                    ? item.logo.startsWith("data:image")
                      ? item.logo // Already a Data URL
                      : `data:image/jpeg;base64,${item.logo}`
                    : "/images/resource/company-6.png";
                  return (
                    <tr key={item.id}>
                      <td>
                        {/* <!-- Job Block --> */}
                        <div className="job-block">
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <Image
                                  width={50}
                                  height={49}
                                  src={logoSrc}
                                  alt="logo"
                                  style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    height: "50px",
                                    width: "50px",
                                  }}
                                />
                              </span>
                              <h4>
                                <Link href={`/job-list/${item?.id}`}>
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
                      <td>{new Date(item?.createdAt)?.toLocaleDateString()}</td>
                      <td className="status">
                        {item?.status || (
                          <p style={{ color: "black", margin: 0 }}>NA</p>
                        )}
                      </td>
                      <td>
                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Aplication">
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
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobListingsTable;
