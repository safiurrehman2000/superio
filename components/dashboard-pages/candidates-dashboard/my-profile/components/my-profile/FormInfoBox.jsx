"use client";

import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import { nextStep } from "@/slices/stepperSlice";
import {
  AGE_OPTIONS,
  GENDERS,
  PROFILE_VISIBILITY_OPTIONS,
} from "@/utils/constants";
import { useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";

const FormInfoBox = () => {
  const dispatch = useDispatch();

  const { trigger } = useFormContext();

  const handleStep = async () => {
    const isValidSection = await trigger([
      "name",
      "phone_number",
      "email",
      "gender",
      "age",
      "profile_visibility",
    ]);

    if (isValidSection) {
      dispatch(nextStep());
    }
  };

  return (
    <form action="#" className="default-form">
      <div className="row">
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

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <SelectField
            label="Gender"
            name="gender"
            options={GENDERS}
            placeholder="Select a gender"
            required
          />
        </div>
        <div className="form-group col-lg-6 col-md-12">
          <SelectField
            label="Age"
            name="age"
            options={AGE_OPTIONS}
            placeholder="Age"
            required
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <SelectField
            label="Show My Profile"
            name="profile_visibility"
            options={PROFILE_VISIBILITY_OPTIONS}
            placeholder=""
            required
          />
        </div>

        {/* <!-- About Company --> */}
        <div className="form-group col-lg-12 col-md-12">
          <TextAreaField label="Description" name="description" />
        </div>

        {/* <!-- Input --> */}
        <div
          className="form-group col-md-12"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <button onClick={handleStep} className="theme-btn btn-style-one">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormInfoBox;
