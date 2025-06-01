"use client";

import {
  updateApplicationStatus,
  useFetchApplications,
  useFetchEmployerJobs,
} from "@/APIs/auth/jobs";
import Loading from "@/components/loading/Loading";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { ResumeModal } from "./ResumeModal";
import { ConfirmationModal } from "./ConfirmationModal";

const WidgetContentBox = () => {
  const selector = useSelector((store) => store.user);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedResume, setSelectedResume] = useState({
    url: "",
    fileName: "",
  });
  const [currentAction, setCurrentAction] = useState({
    type: "",
    applicationId: "",
  });
  const { applications, loading } = useFetchApplications(
    selector.user?.uid,
    selectedJobId,
    refreshKey
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

  const handleStatusUpdate = async (applicationId, actionType) => {
    try {
      const newStatus = actionType === "accept" ? "Accepted" : "Rejected";
      const result = await updateApplicationStatus(applicationId, newStatus);

      if (result.success) {
        setRefreshKey((prev) => prev + 1);
        setConfirmationModalOpen(false);
      } else {
        console.error("Failed to update status:", result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openConfirmationModal = (applicationId, actionType) => {
    setCurrentAction({
      type: actionType,
      applicationId,
    });
    setConfirmationModalOpen(true);
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
                      className="candidate-block-three col-lg-3 col-md-12 col-sm-12"
                      key={candidate?.candidateId}
                    >
                      <div
                        className="file-edit-box job-filter"
                        style={{
                          border: "none",
                          borderRadius: "5px",
                          gap: "10px",
                        }}
                      >
                        <div className="d-flex flex-column flex-column align-items-center">
                          <span
                            className="title me-2"
                            style={{
                              wordBreak: "break-word",
                              fontSize: "15px",
                              WebkitLineClamp: 1,
                              overflow: "hidden",
                            }}
                          >
                            {candidate?.resume?.fileName}
                          </span>

                          {/* Status indicator */}
                          {candidate.status === "Accepted" && (
                            <span className="badge bg-success me-2">
                              Accepted
                            </span>
                          )}
                          {candidate.status === "Rejected" && (
                            <span className="badge bg-danger me-2">
                              Rejected
                            </span>
                          )}
                        </div>
                        <div className="edit-btns option-list">
                          <li>
                            <button
                              data-text="View Aplication"
                              onClick={() => handleViewResume(candidate.resume)}
                            >
                              <span className="la la-eye"></span>
                            </button>
                          </li>
                          {candidate.status === "Active" && (
                            <>
                              <button
                                className="btn btn-sm btn-link text-success"
                                style={{ padding: 0 }}
                                data-text="Approve Application"
                                onClick={() =>
                                  openConfirmationModal(candidate.id, "accept")
                                }
                              >
                                <span className="la la-check"></span>
                              </button>
                              <button
                                className="btn btn-sm btn-link text-danger"
                                style={{ padding: 0 }}
                                data-text="Reject Application"
                                onClick={() =>
                                  openConfirmationModal(candidate.id, "reject")
                                }
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </>
                          )}
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
                            gap: "10px",
                          }}
                        >
                          <div className="d-flex flex-column flex-column flex-column align-items-center">
                            <span
                              className="title me-2"
                              style={{
                                wordBreak: "break-word",
                                fontSize: "15px",
                                WebkitLineClamp: 1,
                                overflow: "hidden",
                              }}
                            >
                              {candidate?.resume?.fileName}
                            </span>

                            {/* Status indicator */}
                            {candidate.status === "Accepted" && (
                              <span className="badge bg-success me-2">
                                Accepted
                              </span>
                            )}
                            {candidate.status === "Rejected" && (
                              <span className="badge bg-danger me-2">
                                Rejected
                              </span>
                            )}
                          </div>
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
                            {candidate.status === "Open" && (
                              <>
                                <button
                                  className="btn btn-sm btn-link text-success"
                                  style={{ padding: 0 }}
                                  data-text="Approve Application"
                                  onClick={() =>
                                    openConfirmationModal(
                                      candidate.id,
                                      "accept"
                                    )
                                  }
                                >
                                  <span className="la la-check"></span>
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-danger"
                                  style={{ padding: 0 }}
                                  data-text="Reject Application"
                                  onClick={() =>
                                    openConfirmationModal(
                                      candidate.id,
                                      "reject"
                                    )
                                  }
                                >
                                  <span className="la la-times-circle"></span>
                                </button>
                              </>
                            )}
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
                            gap: "10px",
                          }}
                        >
                          <div className="d-flex flex-column flex-column align-items-center">
                            <span
                              className="title me-2"
                              style={{
                                wordBreak: "break-word",
                                fontSize: "15px",
                                WebkitLineClamp: 1,
                                overflow: "hidden",
                              }}
                            >
                              {candidate?.resume?.fileName}
                            </span>

                            {/* Status indicator */}
                            {candidate.status === "Accepted" && (
                              <span className="badge bg-success me-2">
                                Accepted
                              </span>
                            )}
                            {candidate.status === "Rejected" && (
                              <span className="badge bg-danger me-2">
                                Rejected
                              </span>
                            )}
                          </div>
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
                            {candidate.status === "Open" && (
                              <>
                                <button
                                  className="btn btn-sm btn-link text-success"
                                  style={{ padding: 0 }}
                                  data-text="Approve Application"
                                  onClick={() =>
                                    openConfirmationModal(
                                      candidate.id,
                                      "accept"
                                    )
                                  }
                                >
                                  <span className="la la-check"></span>
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-danger"
                                  style={{ padding: 0 }}
                                  data-text="Reject Application"
                                  onClick={() =>
                                    openConfirmationModal(
                                      candidate.id,
                                      "reject"
                                    )
                                  }
                                >
                                  <span className="la la-times-circle"></span>
                                </button>
                              </>
                            )}
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
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleStatusUpdate}
        actionType={currentAction.type}
        applicationId={currentAction.applicationId}
      />
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
