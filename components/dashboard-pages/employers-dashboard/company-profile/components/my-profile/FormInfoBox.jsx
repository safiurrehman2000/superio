"use client";

import AutoSelect from "@/components/autoselect/AutoSelect";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { SECTORS, STATES } from "@/utils/constants";
import { useSelector } from "react-redux";

const FormInfoBox = () => {
  const selector = useSelector((store) => store.user);

  return (
    <div className="row default-form">
      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Company Name"
          placeholder="Company Profile"
          name="company_name"
          defaultValue={selector?.user?.company_name}
          required
          fieldType="Name"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Email"
          placeholder="Company Profile"
          type="Email"
          defaultValue={selector?.user?.email}
          name="email"
          fieldType="Email"
          // disabled={true}
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Phone"
          placeholder="000 111 222 333"
          defaultValue={selector?.user?.phone}
          name="phone"
          required
          fieldType="Phone"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Website"
          placeholder="www.google.com"
          defaultValue={selector?.user?.website}
          name="website"
          fieldType="URL"
        />
      </div>

      {/* <!-- Search Select --> */}
      <div className="form-group col-lg-6 col-md-12">
        <AutoSelect
          label="Company Type"
          placeholder="Select Tags"
          name="company_type"
          defaultValue={selector?.user?.company_type}
          options={SECTORS}
          required
        />
      </div>
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Location"
          name="company_location"
          options={STATES}
          placeholder="Select a state"
          defaultValue={selector?.user?.company_location}
          required
        />
      </div>

      {/* <!-- About Company --> */}
      <div className="form-group col-lg-12 col-md-12">
        <TextAreaField
          label="About"
          name="description"
          defaultValue={selector?.user?.description}
          placeholder="Describe what of company you are"
          required
        />
      </div>

      {/* <!-- Input --> */}
    </div>
  );
};

export default FormInfoBox;
