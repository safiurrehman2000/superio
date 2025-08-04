"use client";

import { useUpdateIsFirstTime } from "@/APIs/auth/database";
import { useCreateJobPost } from "@/APIs/auth/jobs";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { addEmployerJob } from "@/slices/userSlice";
import { JOB_TYPE_OPTIONS, SECTORS, STATES } from "@/utils/constants";
import {
  checkSubscriptionStatus,
  validateJobPostingPermission,
  refreshSubscriptionStatus,
} from "@/utils/subscription";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const PostBoxForm = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [jobPostingPermission, setJobPostingPermission] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const selector = useSelector((store) => store.user);
  const { push } = useRouter();

  const methods = useForm({
    mode: "onSubmit",
    defaultValues: {
      name: "",
      description: "",
      email: "",
      "job-type": "",
      state: "",
      tags: [],
      status: "active",
    },
  });
  const {
    handleSubmit,
    formState: { isValid },
    setError: setFormError,
  } = methods;

  // Check subscription status and job posting permission on component mount
  React.useEffect(() => {
    const checkStatus = async () => {
      if (selector?.user?.uid) {
        const status = await checkSubscriptionStatus(selector.user.uid);
        setSubscriptionStatus(status);

        // Check job posting permission
        const permission = await validateJobPostingPermission(
          selector.user.uid
        );
        setJobPostingPermission(permission);
      }
    };
    checkStatus();
  }, [selector?.user?.uid]);

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      if (!selector?.user?.uid) {
        throw new Error("User authentication data is missing.");
      }

      // Validate job posting permission before proceeding
      const permission = await validateJobPostingPermission(selector.user.uid);

      if (!permission.canPost) {
        throw new Error(permission.message);
      }

      const payload = {
        title: data.name,
        description: data.description,
        email: data.email,
        location: data.state,
        jobType: data["job-type"],
        tags: data.tags.map((tag) => tag.value),
        status: "active", // Always post as active if permission is granted
        employerId: selector?.user?.uid,
        isOpen: false,
        createdAt: Date.now(),
        viewCount: 0,
      };

      const { success, error: apiError, job } = await useCreateJobPost(payload);
      if (!success) {
        throw new Error(apiError || "Failed to create job post.");
      }
      if (job) {
        dispatch(addEmployerJob(job));
      }

      await useUpdateIsFirstTime(selector.user.uid, { hasPostedJob: true });

      push("/employers-dashboard/dashboard");
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Error during job post creation:", err);
      setLoading(false);
    }
  };

  // Determine if form should be disabled
  const isFormDisabled = !jobPostingPermission?.canPost || loading;

  // Function to refresh subscription status
  const handleRefreshSubscription = async () => {
    if (refreshing || !selector?.user?.uid) return;

    setRefreshing(true);
    try {
      const result = await refreshSubscriptionStatus(selector.user.uid);
      if (result.success) {
        // Re-check subscription status after refresh
        const status = await checkSubscriptionStatus(selector.user.uid);
        setSubscriptionStatus(status);

        const permission = await validateJobPostingPermission(
          selector.user.uid
        );
        setJobPostingPermission(permission);
      } else {
        setError("Failed to refresh subscription status");
      }
    } catch (error) {
      setError("Error refreshing subscription status");
    } finally {
      setRefreshing(false);
    }
  };

  return (
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
          {/* <!-- Input --> */}
          <div className="form-group col-lg-12 col-md-12">
            <InputField
              name="name"
              placeholder="Title"
              required
              label="Job Title"
              disabled={isFormDisabled}
            />
          </div>

          {/* <!-- About Company --> */}
          <div className="form-group col-lg-12 col-md-12">
            <TextAreaField
              label="Description"
              name="description"
              placeholder="Describe what type of job it is"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* <!-- Input --> */}
          <div className="form-group col-lg-6 col-md-12">
            <InputField
              label="Email"
              name="email"
              placeholder="candidate@gmail.com"
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <SelectField
              label="Job Type"
              name="job-type"
              options={JOB_TYPE_OPTIONS}
              placeholder="Select a Job Type"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* <!-- Input --> */}
          <div className="form-group col-lg-6 col-md-12">
            <SelectField
              label="State"
              name="state"
              options={STATES}
              placeholder="Select a state"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div className="form-group col-lg-6 col-md-12">
            <AutoSelect
              label="Job Tags"
              placeholder="Select Tags"
              name="tags"
              options={SECTORS}
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Display subscription and job posting status */}
          {jobPostingPermission && (
            <div className="form-group col-12">
              <div
                className={`alert ${
                  jobPostingPermission.canPost
                    ? "alert-success"
                    : "alert-warning"
                }`}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid",
                  borderColor: jobPostingPermission.canPost
                    ? "#d4edda"
                    : "#fff3cd",
                  backgroundColor: jobPostingPermission.canPost
                    ? "#d1ecf1"
                    : "#fff3cd",
                  color: jobPostingPermission.canPost ? "#0c5460" : "#856404",
                }}
              >
                <strong>
                  {jobPostingPermission.canPost
                    ? "✅ Can Post Job"
                    : "⚠️ Cannot Post Job"}
                </strong>
                <br />
                {jobPostingPermission.message}
                {jobPostingPermission.subscriptionData && (
                  <div style={{ marginTop: "8px", fontSize: "14px" }}>
                    <strong>Subscription Details:</strong>
                    <br />• Job Limit:{" "}
                    {jobPostingPermission.subscriptionData.jobLimit || 0}
                    <br />• Jobs Posted:{" "}
                    {jobPostingPermission.subscriptionData.jobsPosted || 0}
                    <br />• Remaining Jobs:{" "}
                    {jobPostingPermission.subscriptionData.remainingJobs || 0}
                  </div>
                )}
                {!jobPostingPermission.canPost && (
                  <div style={{ marginTop: "8px" }}>
                    <a
                      href="/employers-dashboard/packages"
                      style={{
                        color: "#856404",
                        textDecoration: "underline",
                        fontWeight: "bold",
                      }}
                    >
                      View subscription plans
                    </a>
                    <button
                      onClick={handleRefreshSubscription}
                      disabled={refreshing}
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: refreshing ? "not-allowed" : "pointer",
                        opacity: refreshing ? 0.6 : 1,
                      }}
                    >
                      {refreshing ? "Refreshing..." : "Refresh Status"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Display error message if exists */}
          {error && (
            <div className="form-group col-12" style={{ color: "red" }}>
              {error}
            </div>
          )}

          {/* <!-- Input --> */}
          <div className="form-group col-lg-12 col-md-12 text-right">
            <button
              className={`theme-btn ${
                loading ? "btn-style-three" : "btn-style-one"
              }`}
              disabled={isFormDisabled}
              style={{
                opacity: isFormDisabled ? 0.6 : 1,
                cursor: isFormDisabled ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularLoader />
                  <p style={{ margin: 0 }}>Creating Job Post...</p>
                </div>
              ) : jobPostingPermission?.canPost ? (
                "Post Job"
              ) : (
                "Cannot Post Job"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PostBoxForm;
