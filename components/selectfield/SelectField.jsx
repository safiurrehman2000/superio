"use client";
import { Controller, useFormContext } from "react-hook-form";

export const SelectField = ({
  label,
  name,
  options = [],
  placeholder,
  required,
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

  return (
    <div className="form-group">
      {label && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            fontSize: "15px !important",
            fontWeight: "500 !important",
          }}
        >
          {label}
          {required ? (
            <p
              style={{
                margin: 0,
                color: "#FA5508",
              }}
            >
              *
            </p>
          ) : (
            ""
          )}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || "This field"} is required!` : false,
        }}
        render={({ field }) => (
          <select
            {...field}
            className={`form-control chosen-single form-select ${
              getError() ? "is-invalid" : ""
            }`}
            onChange={(e) => {
              field.onChange(e);
              if (getError()) {
                clearErrors(name);
              }
            }}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {getError() && <p className="text-danger mt-2">{getError()}</p>}
    </div>
  );
};
