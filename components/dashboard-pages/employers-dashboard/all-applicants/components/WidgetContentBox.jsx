"use client";

import { useFetchApplications, useFetchEmployerJobs } from "@/APIs/auth/jobs";
import Loading from "@/components/loading/Loading";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
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
    selector.user?.uid,
    selectedJobId
  );

  const totalApplications = applications?.length || 0;
  const approvedApplications =
    applications?.filter((app) => app.status === "Accepted")?.length || 0;
  const rejectedApplications =
    applications?.filter((app) => app.status === "Rejected")?.length || 0;

  const handleJobChange = (e) => {
    const selectedTitle = e.target.value;
    if (selectedTitle === "Select Jobs") {
      setSelectedJobId("");
    } else {
      const selectedJob = jobs.find((job) => job.title === selectedTitle);
      setSelectedJobId(selectedJob?.id || "");
    }
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
              <Tab className="tab-btn totals">
                {" "}
                Total(s): {totalApplications}
              </Tab>
              <Tab className="tab-btn approved">
                {" "}
                Approved: {approvedApplications}
              </Tab>
              <Tab className="tab-btn rejected">
                {" "}
                Rejected: {rejectedApplications}
              </Tab>
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
                  {applications
                    ?.filter((app) => app.status === "Accepted")
                    ?.map((candidate) => (
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
                                data-text="View Application"
                                onClick={() =>
                                  handleViewResume(candidate.resume)
                                }
                              >
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Application" disabled>
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Application">
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Application">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabPanel>

              {/* Rejected Applications Tab */}
              <TabPanel>
                <div className="row">
                  {applications
                    ?.filter((app) => app.status === "Rejected")
                    ?.map((candidate) => (
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
                                data-text="View Application"
                                onClick={() =>
                                  handleViewResume(candidate.resume)
                                }
                              >
                                <span className="la la-eye"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Approve Application">
                                <span className="la la-check"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Reject Application" disabled>
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button data-text="Delete Application">
                                <span className="la la-trash"></span>
                              </button>
                            </li>
                          </div>
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
