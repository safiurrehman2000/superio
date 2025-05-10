"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useEffect } from "react";

export const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  fieldType,
  className = "",
}) => {
  const { control, setValue, clearErrors } = useFormContext();

  const fieldValue = useWatch({ name, control });

  useEffect(() => {
    if (!required && fieldValue === "") {
      setValue(name, undefined);
    }
  }, [fieldValue, name, required, setValue]);

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

    if (fieldType === "Email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        return "Please enter a valid email address";
      }
    } else if (fieldType === "Password") {
      const passwordPattern =
        /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d!@#$%^&*(),.?":{}|<>]*$/;
      if (!passwordPattern.test(value)) {
        return "Password must include at least one letter and one number";
      }
      if (value.length < 8) {
        return "Password must be at least 8 characters long";
      }
    }

    return undefined;
  };

  return (
    <div className="form-group">
      {label && (
        <label style={{ display: "flex", alignItems: "center" }}>
          {label}
          {required ? (
            <p style={{ color: "#FA5508", margin: 0 }}>*</p>
          ) : (
            <p></p>
          )}
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
          <input
            {...field}
            type={type}
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
