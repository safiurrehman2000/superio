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
          required: "Full name is required",
        }}
        render={({ field }) => (
          <>
            <Select
              {...field}
              placeholder={placeholder}
              isMulti={isMulti}
              options={options}
              className="basic-multi-select"
              classNamePrefix="select"
              value={field.value}
              onChange={(val) => field.onChange(val)}
            />
          </>
        )}
      />
    </div>
  );
};

export default AutoSelect;
