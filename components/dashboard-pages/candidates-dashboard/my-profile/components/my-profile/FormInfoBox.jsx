"use client";

import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import {
  AGE_OPTIONS,
  GENDERS,
  PROFILE_VISIBILITY_OPTIONS,
} from "@/utils/constants";
import { useSelector } from "react-redux";

const FormInfoBox = () => {
  const selector = useSelector((store) => store.user);
  return (
    <div className="row default-form">
      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Volledige Naam"
          name="name"
          placeholder="Jan Janssens"
          required
          fieldType="Name"
          defaultValue={selector.user?.name}
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Functietitel"
          name="title"
          placeholder="Kassier"
          fieldType="Text"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="Telefoon"
          name="phone_number"
          placeholder="0412345678"
          fieldType="Phone"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <InputField
          label="E-mail"
          name="email"
          placeholder="kandidaat@email.be"
          fieldType="Email"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Geslacht"
          name="gender"
          options={GENDERS}
          placeholder="Selecteer geslacht"
        />
      </div>
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Leeftijd"
          name="age"
          options={AGE_OPTIONS}
          placeholder="Leeftijd"
        />
      </div>

      {/* <!-- Input --> */}
      <div className="form-group col-lg-6 col-md-12">
        <SelectField
          label="Toon Mijn Profiel"
          name="profile_visibility"
          options={PROFILE_VISIBILITY_OPTIONS}
          placeholder=""
        />
      </div>

      {/* <!-- About Company --> */}
      <div className="form-group col-lg-12 col-md-12">
        <TextAreaField label="Beschrijving" name="description" />
      </div>

      {/* <!-- Input --> */}
    </div>
  );
};

export default FormInfoBox;
