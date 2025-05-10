"use client";

import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import {
  AGE_OPTIONS,
  GENDERS,
  PROFILE_VISIBILITY_OPTIONS,
} from "@/utils/constants";

const FormInfoBox = () => {
  return (
    <div className="row default-form">
      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Full Name"
          name="name"
          placeholder="Jerome"
          required
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField label="Job Title" name="title" placeholder="Cashier" />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Phone"
          name="phone_number"
          placeholder="111222333444"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Email"
          name="email"
          placeholder="candidate@gmail.com"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Gender"
          name="gender"
          options={GENDERS}
          placeholder="Select a gender"
        />
      </div>
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Age"
          name="age"
          options={AGE_OPTIONS}
          placeholder="Age"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Show My Profile"
          name="profile_visibility"
          options={PROFILE_VISIBILITY_OPTIONS}
          placeholder=""
        />
      </div>

      {/* <!-- About Company --> */}
      <div className="form-group col-lg-12 col-md-12">
        <TextAreaField label="Description" name="description" />
      </div>

      {/* <!-- Input --> */}
    </div>
  );
};

export default FormInfoBox;
