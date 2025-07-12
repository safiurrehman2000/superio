import { Controller, useFormContext } from "react-hook-form";
import Select from "react-select";

const AutoSelect = ({
  label,
  name,
  placeholder,
  options,
  isMulti = true,
  defaultValue,
  required = false,
}) => {
  const { control } = useFormContext();
  return (
    <div>
      {label && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "15px",
            fontWeight: 500,
            marginBottom: "6px",
          }}
        >
          {label}
          {required ? <p style={{ color: "#FA5508", margin: 0 }}>*</p> : ""}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          required: required ? `${label || "This field"} is required!` : false,
        }}
        render={({ field, fieldState }) => (
          <>
            <Select
              {...field}
              placeholder={placeholder}
              isMulti={isMulti}
              options={options}
              className={`basic-multi-select ${
                fieldState.error ? "border-danger" : ""
              }`}
              classNamePrefix="select"
              value={field.value}
              onChange={(val) => field.onChange(val)}
            />
            {fieldState.error && (
              <p className="text-danger mt-2" style={{ fontSize: "0.875rem" }}>
                {fieldState.error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default AutoSelect;
