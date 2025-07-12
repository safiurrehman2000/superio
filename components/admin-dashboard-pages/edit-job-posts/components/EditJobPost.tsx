"use client";

import { updateJob, useGetJobListing } from "@/APIs/auth/jobs";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { JOB_TYPE_OPTIONS, SECTORS, STATES } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EditJobPost = () => {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { push } = useRouter();
  const {
    data: jobs,
    loading: jobsLoading,
    error: jobsError,
  } = useGetJobListing();

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

  const {
    handleSubmit,
    formState: { isValid },
    setError: setFormError,
    reset,
    setValue,
  } = methods;

  // Handle job selection
  const handleJobSelection = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId) {
      const selectedJob = jobs.find((job) => job.id === jobId);
      if (selectedJob) {
        // Populate form with selected job data
        setValue("name", selectedJob.title || "");
        setValue("description", selectedJob.description || "");
        setValue("email", selectedJob.email || "");
        setValue("job-type", selectedJob.jobType || "");
        setValue("state", selectedJob.location || "");
        setValue(
          "tags",
          selectedJob.tags
            ? selectedJob.tags.map((tag) => ({ value: tag, label: tag }))
            : []
        );
      }
    } else {
      // Reset form when no job is selected
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

      // Reset form and selection after successful update
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
          {/* Job Selection */}
          <div className="form-group col-lg-12 col-md-12 mb-4">
            <label>Select Job to Edit</label>
            <select
              className="chosen-single form-select"
              value={selectedJobId}
              onChange={(e) => handleJobSelection(e.target.value)}
            >
              <option value="">Select a job to edit...</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location} (
                  {new Date(job.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Edit Form */}
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
                  {/* Job Title */}
                  <div className="form-group col-lg-12 col-md-12">
                    <InputField
                      name="name"
                      placeholder="Title"
                      required
                      label="Job Title"
                      fieldType="text"
                      defaultValue=""
                      disabled={false}
                    />
                  </div>

                  {/* Description */}
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

                  {/* Email */}
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

                  {/* Job Type */}
                  <div className="form-group col-lg-6 col-md-12">
                    <SelectField
                      label="Job Type"
                      name="job-type"
                      options={JOB_TYPE_OPTIONS}
                      placeholder="Select a Job Type"
                      required
                    />
                  </div>

                  {/* State */}
                  <div className="form-group col-lg-6 col-md-12">
                    <SelectField
                      label="State"
                      name="state"
                      options={STATES}
                      placeholder="Select a state"
                      required
                    />
                  </div>

                  {/* Job Tags */}
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

                  {/* Display error message if exists */}
                  {error && (
                    <div className="form-group col-12" style={{ color: "red" }}>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="form-group col-lg-12 col-md-12 text-right">
                    <button
                      className={`theme-btn ${
                        loading ? "btn-style-three" : "btn-style-one"
                      }`}
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
                  </div>
                </div>
              </form>
            </FormProvider>
          )}

          {/* Instructions when no job is selected */}
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
        </div>
      </div>
    </div>
  );
};

export default EditJobPost;
