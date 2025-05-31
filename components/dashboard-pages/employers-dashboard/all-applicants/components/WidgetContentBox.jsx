"use client";

import { useFetchApplications, useFetchEmployerJobs } from "@/APIs/auth/jobs";
import Loading from "@/components/loading/Loading";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import candidatesData from "../../../../../data/candidates";
import { ResumeModal } from "./ResumeModal";

const WidgetContentBox = () => {
  const selector = useSelector((store) => store.user);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState({
    url: "",
    fileName: "",
  });
  const { applications, loading } = useFetchApplications(
    selector.user.uid,
    selectedJobId
  );

  const handleJobChange = (e) => {
    const selectedTitle = e.target.value;
    const selectedJob = jobs.find((job) => job.title === selectedTitle);
    setSelectedJobId(selectedJob?.id || "");
  };
  const handleViewResume = (resume) => {
    setSelectedResume({
      url: resume.url || "",
      fileName: resume.fileName || "Resume",
    });
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const jobsData = await useFetchEmployerJobs(selector.user?.uid);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    if (selector.user?.uid) {
      fetchJobs();
    } else {
      setJobs([]);
      setJobsLoading(false);
    }
  }, [selector.user?.uid]);
  return (
    <div className="widget-content">
      <div className="tabs-box">
        <Tabs>
          <div className="aplicants-upper-bar">
            <select
              style={{ borderRadius: "4px", cursor: "pointer" }}
              onChange={handleJobChange}
            >
              <option>Select Jobs</option>
              {jobs?.map((item) => {
                return <option key={item?.id}>{item?.title}</option>;
              })}
            </select>

            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals"> Total(s): 6</Tab>
              <Tab className="tab-btn approved"> Approved: 2</Tab>
              <Tab className="tab-btn rejected"> Rejected(s): 4</Tab>
            </TabList>
          </div>
          {jobsLoading || loading ? (
            <Loading />
          ) : (
            <div className="tabs-content">
              <TabPanel>
                <div className="row">
                  {applications?.map((candidate) => (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={candidate?.candidateId}
                    >
                      <div
                        className="file-edit-box job-filter"
                        style={{
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        <span
                          className="title"
                          style={{
                            wordBreak: "break-word",
                            fontSize: "15px",
                            WebkitLineClamp: 1,
                            overflow: "hidden",
                          }}
                        >
                          {candidate?.resume?.fileName}
                        </span>
                        <div className="edit-btns option-list">
                          <li>
                            <button
                              data-text="View Aplication"
                              onClick={() => handleViewResume(candidate.resume)}
                            >
                              <span className="la la-eye"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Approve Aplication">
                              <span className="la la-check"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Reject Aplication">
                              <span className="la la-times-circle"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Delete Aplication">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </div>
                      </div>

                      {/* End admin options box */}
                    </div>
                  ))}
                </div>
              </TabPanel>
              {/* End total applicants */}

              <TabPanel>
                <div className="row">
                  {candidatesData.slice(17, 19).map((candidate) => (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={candidate.id}
                    >
                      <div className="inner-box">
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={candidate.avatar}
                              alt="candidates"
                            />
                          </figure>
                          <h4 className="name">
                            <Link
                              href={`/candidates-single-v1/${candidate.id}`}
                            >
                              {candidate.name}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {candidate.designation}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {candidate.location}
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $
                              {candidate.hourlyRate} / hour
                            </li>
                          </ul>
                          {/* End candidate-info */}

                          <ul className="post-tags">
                            {candidate.tags.map((val, i) => (
                              <li key={i}>
                                <a href="#">{val}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* End content */}

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Aplication">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* End admin options box */}
                      </div>
                    </div>
                  ))}
                </div>
              </TabPanel>
              {/* End approved applicants */}

              <TabPanel>
                <div className="row">
                  {candidatesData.slice(17, 21).map((candidate) => (
                    <div
                      className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                      key={candidate.id}
                    >
                      <div className="inner-box">
                        <div className="content">
                          <figure className="image">
                            <Image
                              width={90}
                              height={90}
                              src={candidate.avatar}
                              alt="candidates"
                            />
                          </figure>
                          <h4 className="name">
                            <Link
                              href={`/candidates-single-v1/${candidate.id}`}
                            >
                              {candidate.name}
                            </Link>
                          </h4>

                          <ul className="candidate-info">
                            <li className="designation">
                              {candidate.designation}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>{" "}
                              {candidate.location}
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> $
                              {candidate.hourlyRate} / hour
                            </li>
                          </ul>
                          {/* End candidate-info */}

                          <ul className="post-tags">
                            {candidate.tags.map((val, i) => (
                              <li key={i}>
                                <a href="#">{val}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* End content */}

                        <div className="option-box">
                          <ul className="option-list">
                            <li>
                              <button data-text="View Aplication">
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Aplication">
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Aplication">
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Aplication">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </ul>
                        </div>
                        {/* End admin options box */}
                      </div>
                    </div>
                  ))}
                </div>
              </TabPanel>
              {/* End rejected applicants */}
            </div>
          )}
        </Tabs>
      </div>
      <ResumeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        resumeUrl={selectedResume.url}
        fileName={selectedResume.fileName}
      />
    </div>
  );
};

export default WidgetContentBox;
