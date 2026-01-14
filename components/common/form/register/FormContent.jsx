"use client";
import { useSignUp } from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { setUserType } from "@/slices/userSlice";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

const FormContent = ({ userType, onRegisterSuccess }) => {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const { handleSubmit, setValue, formState: isValid } = methods;
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    dispatch(setUserType(userType));
    const result = await useSignUp(data.email, data.password, userType);

    if (!result.success) {
      if (result.errors) {
        Object.keys(result.errors).forEach((key) => {
          methods.setError(key, { message: result.errors[key] });
        });
      } else if (result.apiError) {
        setApiError(result.apiError);
        setValue("email", "");
        setValue("password", "");
        methods.reset();
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    if (onRegisterSuccess) onRegisterSuccess();
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        action="add-parcel.html"
      >
        <InputField
          label="E-mailadres"
          name="email"
          type="email"
          placeholder="E-mail"
          required
          fieldType="Email"
        />
        <InputField
          label="Wachtwoord"
          name="password"
          type="password"
          placeholder="Wachtwoord"
          required
          fieldType="Password"
        />
        <div className="form-group">
          <button
            disabled={isLoading || !isValid}
            className={`theme-btn btn-style-one btn ${
              isLoading ? "btn-secondary disabled" : ""
            }`}
            type="submit"
          >
            {isLoading ? (
              <div className="d-flex justify-content-center gap-2 align-items-center">
                <CircularLoader size={24} strokeColor="#000" />
                <p className={isLoading ? "text-black" : "text-white"}>
                  Registreren...
                </p>
              </div>
            ) : (
              "Registreren"
            )}
          </button>
          {apiError && (
            <p className="text-center text-danger mt-2">{apiError}</p>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default FormContent;
