"use client";
import {
  sendVerificationCode,
  verifyAndRegister,
  useLogIn,
} from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { setUserType } from "@/slices/userSlice";
import { successToast } from "@/utils/toast";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

const FormContent = ({ userType, onRegisterSuccess }) => {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
    mode: "onChange",
  });
  const { handleSubmit, setValue, watch, formState: isValid } = methods;
  const [step, setStep] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const dispatch = useDispatch();

  const onSendCode = async (data) => {
    setIsLoading(true);
    setApiError("");
    dispatch(setUserType(userType));
    if (typeof window !== "undefined") {
      localStorage.setItem("registrationUserType", userType);
    }

    const result = await sendVerificationCode(data.email, userType);

    if (!result.success) {
      setApiError(result.apiError || "Kon verificatiecode niet verzenden.");
      setIsLoading(false);
      return;
    }

    setPendingEmail(data.email);
    setPendingPassword(data.password);
    setStep("verify");
    setValue("code", "");
    successToast("Verificatiecode verzonden. Controleer uw e-mail.");
    setIsLoading(false);
  };

  const onVerifyAndRegister = async (data) => {
    setIsLoading(true);
    setApiError("");

    const registerResult = await verifyAndRegister(
      pendingEmail,
      pendingPassword,
      userType,
      data.code
    );

    if (!registerResult.success) {
      setApiError(registerResult.apiError || "Registratie mislukt.");
      setIsLoading(false);
      return;
    }

    const loginResult = await useLogIn(pendingEmail, pendingPassword, userType);

    if (!loginResult.success) {
      setApiError(
        loginResult.apiError ||
          "Account aangemaakt, maar inloggen mislukt. Probeer in te loggen."
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    if (onRegisterSuccess) onRegisterSuccess();
  };

  const handleResendCode = async () => {
    if (!pendingEmail) return;
    setIsLoading(true);
    setApiError("");
    const result = await sendVerificationCode(pendingEmail, userType);
    if (result.success) {
      successToast("Nieuwe code verzonden.");
    } else {
      setApiError(result.apiError || "Kon code niet opnieuw verzenden.");
    }
    setIsLoading(false);
  };

  if (step === "verify") {
    return (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onVerifyAndRegister)}>
          <p className="text-center mb-3" style={{ color: "#666" }}>
            We hebben een 6-cijferige code gestuurd naar{" "}
            <strong>{pendingEmail}</strong>
          </p>
          <InputField
            label="Verificatiecode"
            name="code"
            type="text"
            placeholder="123456"
            required
            fieldType="text"
          />
          <div className="form-group">
            <button
              disabled={isLoading || !watch("code")}
              className={`theme-btn btn-style-one btn w-100 ${
                isLoading ? "btn-secondary disabled" : ""
              }`}
              type="submit"
            >
              {isLoading ? (
                <div className="d-flex justify-content-center gap-2 align-items-center">
                  <CircularLoader size={24} strokeColor="#000" />
                  <span>Bevestigen...</span>
                </div>
              ) : (
                "Account bevestigen"
              )}
            </button>
            {apiError && (
              <p className="text-center text-danger mt-2">{apiError}</p>
            )}
          </div>
          <div className="text-center mt-3" style={{ fontSize: "14px" }}>
            <button
              type="button"
              className="btn btn-link p-0"
              disabled={isLoading}
              onClick={handleResendCode}
            >
              Code opnieuw verzenden
            </button>
            <span className="mx-2">·</span>
            <button
              type="button"
              className="btn btn-link p-0"
              disabled={isLoading}
              onClick={() => {
                setStep("details");
                setApiError("");
              }}
            >
              E-mail wijzigen
            </button>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSendCode)}>
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
          placeholder="Wachtwoord (min. 6 tekens)"
          required
          fieldType="Password"
        />
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
          Na registratie ontvangt u een verificatiecode per e-mail.
        </p>
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
                  Code verzenden...
                </p>
              </div>
            ) : (
              "Verificatiecode verzenden"
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
