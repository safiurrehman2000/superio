"use client";

import AutoSelect from "@/components/autoselect/AutoSelect";
import { InputField } from "@/components/inputfield/InputField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { SECTORS } from "@/utils/constants";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import Select from "react-select";

const FormInfoBox = () => {
  const selector = useSelector((store) => store.user);
  const { handleSubmit } = useFormContext();

  const onSubmit = (data) => {};
  return (
    <div className="row default-form">
      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Company Name"
          placeholder="Company Profile"
          // defaultValue="Safi"
          name="company_name"
          required
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Email"
          placeholder="Company Profile"
          type="Email"
          defaultValue={selector.user.email}
          name="email"
          disabled={true}
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Phone"
          placeholder="000 111 222 333"
          name="phone"
          required
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Website"
          placeholder="www.google.com"
          name="website"
        />
      </div>

      {/* <!-- Search Select --> */}
      <div className="form-group col-lg-6 col-md-12">
        <AutoSelect
          label="Company Type"
          placeholder="Select Tags"
          name="company_type"
          options={SECTORS}
          required
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
        <button
          onSubmit={handleSubmit(onSubmit)}
          className="theme-btn btn-style-one"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default FormInfoBox;
