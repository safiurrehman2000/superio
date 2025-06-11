import { SelectField } from "@/components/selectfield/SelectField";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function JobAlertModal({ show, handleClose, onSubmit }) {
  const [frequency, setFrequency] = useState("weekly");
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      frequency: "weekly",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit2 = (data) => {
    onSubmit(data?.frequency);
    handleClose();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit2)}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "400px",
              position: "relative",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <h3>Create Job Alert</h3>
            <div style={{ marginBottom: "20px" }}>
              <SelectField
                label={"How often do you want job alerts?"}
                name="frequency"
                options={[
                  {
                    value: "weekly",
                    label: "weekly",
                  },
                  {
                    value: "monthly",
                    label: "monthly",
                  },
                ]}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "10px 20px",
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
