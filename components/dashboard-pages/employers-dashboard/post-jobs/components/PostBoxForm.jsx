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
import { checkSubscriptionStatus } from "@/utils/subscription";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const PostBoxForm = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
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

  // Check subscription status on component mount
  React.useEffect(() => {
    const checkStatus = async () => {
      if (selector?.user?.uid) {
        const status = await checkSubscriptionStatus(selector.user.uid);
        setSubscriptionStatus(status);
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

      // Check subscription status
      const subscriptionStatus = await checkSubscriptionStatus(
        selector.user.uid
      );

      const payload = {
        title: data.name,
        description: data.description,
        email: data.email,
        location: data.state,
        jobType: data["job-type"],
        tags: data.tags.map((tag) => tag.value),
        status: subscriptionStatus.active ? "active" : "archived",
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
            />
          </div>

          {/* <!-- About Company --> */}
          <div className="form-group col-lg-12 col-md-12">
            <TextAreaField
              label="Description"
              name="description"
              placeholder="Describe what type of job it is"
              required
            />
          </div>

          {/* <!-- Input --> */}
          <div className="form-group col-lg-6 col-md-12">
            <InputField
              label="Email"
              name="email"
              placeholder="candidate@gmail.com"
              required
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

          {/* <!-- Input --> */}
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
            />
          </div>

          {/* Display subscription status info */}
          {subscriptionStatus && (
            <div className="form-group col-12">
              <div
                className={`alert ${
                  subscriptionStatus.active ? "alert-success" : "alert-warning"
                }`}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid",
                  borderColor: subscriptionStatus.active
                    ? "#d4edda"
                    : "#fff3cd",
                  backgroundColor: subscriptionStatus.active
                    ? "#d1ecf1"
                    : "#fff3cd",
                  color: subscriptionStatus.active ? "#0c5460" : "#856404",
                }}
              >
                <strong>
                  {subscriptionStatus.active
                    ? "✅ Active Subscription"
                    : "⚠️ No Active Subscription"}
                </strong>
                <br />
                {subscriptionStatus.active
                  ? "Your job will be posted as ACTIVE and visible to candidates."
                  : "Your job will be posted as ARCHIVED and will not be visible to candidates until you have an active subscription. "}
                {!subscriptionStatus.active && (
                  <a
                    href="/employers-dashboard/packages"
                    style={{
                      color: "#856404",
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  >
                    Subscribe to a plan to activate your jobs.
                  </a>
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
            >
              {loading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularLoader />
                  <p style={{ margin: 0 }}>Creating Job Post...</p>
                </div>
              ) : subscriptionStatus?.active ? (
                "Post Job (Active)"
              ) : (
                "Post Job (Archived)"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PostBoxForm;
