"use client";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  fieldType,
  className = "",
  defaultValue,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useFormContext();

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      <div className="position-relative">
        <Controller
          disabled={disabled}
          name={name}
          control={control}
          rules={{
            required: required
              ? `${label || "This field"} is required!`
              : false,
            validate: validateField,
          }}
          defaultValue={defaultValue}
          render={({ field }) => (
            <input
              {...field}
              type={
                fieldType === "Password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              placeholder={placeholder}
              required={required}
              className={`form-control ${className} ${
                getError() ? "border-danger" : ""
              }`}
              style={{
                paddingRight: fieldType === "Password" ? "3rem" : "0.75rem",
              }}
              onChange={(e) => {
                field.onChange(e);
                const error = validateField(e.target.value);
                if (error) {
                  setError(name, { type: "manual", message: error });
                } else {
                  clearErrors(name);
                }
              }}
              onBlur={(e) => {
                field.onBlur();
                const error = validateField(e.target.value);
                if (error) {
                  setError(name, { type: "manual", message: error });
                } else {
                  clearErrors(name);
                }
              }}
            />
          )}
        />
        {fieldType === "Password" && (
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
            style={{
              textDecoration: "none",
              color: "#6c757d",
              padding: "0.375rem 0.75rem",
              marginRight: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>
      {getError() && (
        <p className="text-danger mt-2" style={{ fontSize: "0.875rem" }}>
          {getError()}
        </p>
      )}
    </div>
  );
};
