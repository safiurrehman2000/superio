"use client";
import { useLogIn } from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import PropTypes from "prop-types";

import { InputField } from "@/components/inputfield/InputField";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setAuthPersistence } from "@/APIs/auth/auth";

const FormContentModal = ({ onLoginSuccess }) => {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });
  const {
    handleSubmit,
    setValue,
    formState: isValid,
    register,
    watch,
  } = methods;
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { push } = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");

    try {
      await setAuthPersistence(data.rememberMe);
    } catch (e) {
      setApiError("Kon authenticatiepersistentie niet instellen.");
      setIsLoading(false);
      return;
    }

    const result = await useLogIn(data.email, data.password);

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
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <h3 className="text-center">Login bij De Flexijobber</h3>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} method="post">
          <InputField
            label="E-mail"
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
            <div className="field-outer">
              <div className="input-group checkboxes square">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  name="rememberMe"
                  id="remember"
                  checked={watch("rememberMe")}
                  onChange={(e) => setValue("rememberMe", e.target.checked)}
                />
                <label htmlFor="remember" className="remember">
                  <span className="custom-checkbox"></span> Onthoud mij
                </label>
              </div>
              <a href="/forgot-password" className="pwd">
                Wachtwoord vergeten?
              </a>
            </div>
          </div>
          <div className="form-group">
            <button
              disabled={isLoading || !isValid}
              className={`theme-btn btn-style-one btn ${
                isLoading ? "btn-secondary disabled" : ""
              } `}
              type="submit"
            >
              {isLoading ? (
                <div className="d-flex justify-content-center gap-2">
                  <CircularLoader />
                  <p className={`${isLoading ? "text-black" : "text-white"}`}>
                    Inloggen...
                  </p>
                </div>
              ) : (
                "Inloggen"
              )}
            </button>
            {apiError && (
              <p className="text-center text-danger mt-2">{apiError}</p>
            )}
          </div>
        </form>
      </FormProvider>

      <div className="bottom-box">
        <div className="text d-flex justify-content-center">
          Nog geen account?&nbsp;
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (typeof window !== "undefined") {
                const modalEl = document.getElementById("loginPopupModal");

                const backdrop = document.querySelector(".modal-backdrop");
                if (backdrop) {
                  backdrop.remove();
                }

                document.body.classList.remove("modal-open");
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";

                if (window.bootstrap && modalEl) {
                  const modal = window.bootstrap.Modal.getInstance(modalEl);
                  if (modal) {
                    modal.hide();
                  }
                }
              }

              push("/register");
            }}
          >
            Registreren
          </div>
        </div>
      </div>
    </div>
  );
};

FormContentModal.propTypes = {
  onLoginSuccess: PropTypes.func,
};

export default FormContentModal;
