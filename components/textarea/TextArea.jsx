"use client";
import { Controller, useFormContext } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";

export const TextAreaField = ({
  label,
  name,
  placeholder,
  required,
  className = "",
  minLength,
  maxLength,
}) => {
  const { control, clearErrors } = useFormContext();
  const {
    formState: { errors },
  } = useFormContext();

  const getError = () => {
    try {
      const errorPath = name.replaceAll(".", "?.");
      return eval(`errors?.${errorPath}?.message`);
    } catch (err) {
      return undefined;
    }
  };

  const validateField = (value) => {
    if (!value && !required) return undefined;

    if (minLength && value && value.length < minLength) {
      return `This field must be at least ${minLength} characters long`;
    }

    if (maxLength && value && value.length > maxLength) {
      return `This field must not exceed ${maxLength} characters`;
    }

    return undefined;
  };

  return (
    <div className="form-group">
      {label && (
        <label style={{ display: "flex", alignItems: "center" }}>
          {label}
          {required ? <p style={{ color: "#FA5508", margin: 0 }}>*</p> : ""}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || "This field"} is required!` : false,
          validate: validateField,
        }}
        render={({ field }) => (
          <textarea
            {...field}
            placeholder={placeholder}
            required={required}
            className={`form-control ${className} ${
              getError() ? "is-invalid" : ""
            }`}
            onChange={(e) => {
              field.onChange(e);
              if (getError()) {
                clearErrors(name);
              }
            }}
          />
        )}
      />
      {getError() && <p className="text-danger mt-2">{getError()}</p>}
    </div>
  );
};
