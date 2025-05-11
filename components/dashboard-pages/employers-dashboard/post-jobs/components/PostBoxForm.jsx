"use client";

import { useUpdateIsFirstTime } from "@/APIs/auth/database";
import { useCreateJobPost } from "@/APIs/auth/jobs";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { GENDERS } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const PostBoxForm = () => {
  const [loading, setLoading] = useState(false);
  const selector = useSelector((store) => store.user);
  const { push } = useRouter();

  const methods = useForm();
  const {
    handleSubmit,
    formState: { isValid },
  } = methods;
  const specialisms = [
    { value: "Banking", label: "Banking" },
    { value: "Digital & Creative", label: "Digital & Creative" },
    { value: "Retail", label: "Retail" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Managemnet", label: "Managemnet" },
    { value: "Accounting & Finance", label: "Accounting & Finance" },
    { value: "Digital", label: "Digital" },
    { value: "Creative Art", label: "Creative Art" },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      title: data.name,
      description: data.description,
      email: data.email,
      location: data.state,
      jobType: data["job-type"],
      tags: data.tags.map((tag) => tag.value),
      employerId: selector?.user?.uid,
      isOpen: false,
      createdAt: Date.now(),
    };
    const { success } = await useCreateJobPost(payload);
    await useUpdateIsFirstTime(selector.user.uid);
    push("/pricing");
    setLoading(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="default-form">
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
              options={GENDERS}
              placeholder="Select a Job Type"
              required
            />
          </div>

          {/* <!-- Input --> */}
          <div className="form-group col-lg-6 col-md-12">
            <SelectField
              label="State"
              name="state"
              options={GENDERS}
              placeholder="Select a state"
              required
            />
          </div>
          <div className="form-group col-lg-6 col-md-12">
            <AutoSelect
              label="Job Tags"
              placeholder="Select Tags"
              name="tags"
              options={specialisms}
              required
            />
          </div>

          {/* <!-- Input --> */}
          <div className="form-group col-lg-12 col-md-12 text-right">
            <button disabled={!isValid} className="theme-btn btn-style-one">
              {loading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularLoader />
                  <p style={{ m: 0 }}>Creating Job Post...</p>
                </div>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PostBoxForm;
