"use client";

import { updateJob, deleteJob } from "@/APIs/auth/jobs";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import {
  formatString,
  JOB_TYPE_OPTIONS,
  SECTORS,
  STATES,
} from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { DeleteConfirmationModal } from "@/components/dashboard-pages/employers-dashboard/manage-jobs/components/DeleteModal";
import Select from "react-select";

const EditJobPost = () => {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { push } = useRouter();
  const selector = useSelector((store: any) => store.user);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const jobsRef = collection(db, "jobs");
      const jobsSnap = await getDocs(jobsRef);
      const jobs = jobsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(jobs);
    } catch (err) {
      setJobsError(err);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      email: "",
      "job-type": "",
      state: "",
      tags: [],
    },
  });

  const { handleSubmit, reset, setValue } = methods;

  // Transform jobs data for react-select
  const jobOptions = jobs.map((job) => ({
    value: job.id,
    label: `${job.title} - ${job.location} (${new Date(
      job.createdAt
    ).toLocaleDateString()})`,
    job: job, // Keep the full job object for reference
  }));

  const handleJobSelection = (selectedOption) => {
    const jobId = selectedOption ? selectedOption.value : "";
    setSelectedJobId(jobId);
    if (jobId) {
      const selectedJob = jobs.find((job) => job.id === jobId);
      if (selectedJob) {
        setValue("name", selectedJob.title || "");
        setValue("description", selectedJob.description || "");
        setValue("email", selectedJob.email || "");
        setValue("job-type", selectedJob.jobType || "");
        setValue("state", selectedJob.location || "");
        setValue(
          "tags",
          selectedJob.tags
            ? selectedJob.tags.map((tag) => ({
                value: tag,
                label: formatString(tag),
              }))
            : []
        );
      }
    } else {
      reset();
    }
  };

  const onSubmit = async (data) => {
    if (loading) return;
    if (!selectedJobId) {
      setError("Please select a job to edit");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: data.name,
        description: data.description,
        email: data.email,
        location: data.state,
        jobType: data["job-type"],
        tags: data.tags.map((tag) => tag.value),
      };

      const { success, error: apiError } = await updateJob(
        selectedJobId,
        payload
      );
      if (!success) {
        throw new Error(apiError || "Failed to update job post.");
      }

      reset();
      setSelectedJobId("");
      push("/admin-dashboard/edit-job-posts");
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Error during job post update:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!selectedJobId) {
      setError("Please select a job to delete");
      return;
    }
    if (!selector?.user?.uid) {
      setError("User authentication data is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { success, error: apiError } = await deleteJob(
        selectedJobId,
        selector.user.uid
      );
      if (!success) {
        throw new Error(apiError || "Failed to delete job post.");
      }
      reset();
      setSelectedJobId("");
      fetchJobs();
      push("/admin-dashboard/edit-job-posts");
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Error during job post delete:", err);
    } finally {
      setLoading(false);
    }
  };

  if (jobsLoading) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Edit Job Posts</h4>
          </div>
          <div className="widget-content">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "50px",
              }}
            >
              <CircularLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Edit Job Posts</h4>
          </div>
          <div className="widget-content">
            <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
              Error loading jobs: {jobsError.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Edit Job Posts</h4>
        </div>

        <div className="widget-content">
          <div className="form-group col-lg-12 col-md-12 mb-4">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "15px",
                fontWeight: "500",
                marginBottom: "6px",
              }}
            >
              Select Job to Edit
            </label>
            <Select
              value={
                jobOptions.find((option) => option.value === selectedJobId) ||
                null
              }
              onChange={handleJobSelection}
              options={jobOptions}
              placeholder="Search and select a job to edit..."
              isClearable
              isSearchable
              className="basic-single-select"
              classNamePrefix="select"
              noOptionsMessage={() => "No jobs found"}
              loadingMessage={() => "Loading jobs..."}
              isLoading={jobsLoading}
            />
          </div>

          {selectedJobId && (
            <FormProvider {...methods}>
              <form
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(onSubmit)();
                  }
                }}
                onSubmit={handleSubmit(onSubmit)}
                className="default-form"
              >
                <div className="row">
                  <div className="form-group col-lg-12 col-md-12">
                    <InputField
                      name="name"
                      placeholder="Title"
                      required
                      label="Job Title"
                      fieldType="Text"
                      defaultValue=""
                      disabled={false}
                    />
                  </div>

                  <div className="form-group col-lg-12 col-md-12">
                    <TextAreaField
                      label="Description"
                      name="description"
                      placeholder="Describe what type of job it is"
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className="form-group col-lg-6 col-md-12">
                    <InputField
                      label="Email"
                      name="email"
                      placeholder="candidate@gmail.com"
                      required
                      fieldType="Email"
                      defaultValue=""
                      disabled={false}
                    />
                  </div>

                  <div className="form-group col-lg-6 col-md-12">
                    <SelectField
                      label="Job Type"
                      name="job-type"
                      options={JOB_TYPE_OPTIONS}
                      placeholder="Select a Job Type"
                      required
                    />
                  </div>

                  <div className="form-group col-lg-6 col-md-12">
                    <SelectField
                      label="State"
                      name="state"
                      options={STATES}
                      placeholder="Select a state"
                      required
                    />
                  </div>

                  <div className="form-group col-lg-6 col-md-12">
                    <AutoSelect
                      label="Job Tags"
                      placeholder="Select Tags"
                      name="tags"
                      options={SECTORS}
                      required
                      defaultValue={[]}
                    />
                  </div>

                  <div
                    className="form-group col-lg-12 col-md-12 text-right"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <button
                      className={`theme-btn ${
                        loading ? "btn-style-three" : "btn-style-one"
                      }`}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <CircularLoader />
                          <p style={{ margin: 0 }}>Updating Job Post...</p>
                        </div>
                      ) : (
                        "Update Job"
                      )}
                    </button>
                    <button
                      type="button"
                      className="theme-btn btn-style-two ml-2"
                      style={{ background: "#dc3545", color: "#fff" }}
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete Job"}
                    </button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}

          {!selectedJobId && (
            <div
              className="text-center"
              style={{ padding: "40px", color: "#666" }}
            >
              <p>
                Please select a job from the dropdown above to edit its
                information.
              </p>
            </div>
          )}
          {error && (
            <div style={{ color: "red", textAlign: "center", marginTop: 10 }}>
              {error}
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={loading}
      />
    </div>
  );
};

export default EditJobPost;
