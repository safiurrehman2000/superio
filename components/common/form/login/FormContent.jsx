"use client";
import { setAuthPersistence, useLogIn } from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { InputField } from "@/components/inputfield/InputField";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const FormContent = () => {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });
  const searchParams = useSearchParams();
  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors, isValid },
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
    push("/");
  };

  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <div className="text-center mb-3">
        <Link
          href="/"
          className="theme-btn btn-style-one btn"
          style={{
            textDecoration: "none",
            display: "inline-block",
            padding: "10px 20px",
            fontSize: "14px",
          }}
        >
          <i className="la la-home"></i> Terug naar home
        </Link>
      </div>
      <h3 className="text-center">Login bij De Flexijobber</h3>

      <FormProvider {...methods}>
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(onSubmit)();
            }
          }}
          onSubmit={handleSubmit(onSubmit)}
          method="post"
        >
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
                  checked={methods.watch("rememberMe")}
                  onChange={(e) =>
                    methods.setValue("rememberMe", e.target.checked)
                  }
                />
                <label htmlFor="remember" className="remember">
                  <span className="custom-checkbox"></span> Onthoud mij
                </label>
              </div>
              <a
                href="/forgot-password"
                className="pwd"
                style={{ textDecoration: "underline", color: "#fa5508" }}
              >
                Wachtwoord vergeten?
              </a>
            </div>
          </div>
          <div className="form-group">
            <button
              disabled={isLoading || !isValid}
              className={`theme-btn btn-style-one btn ${
                isLoading ? "btn-secondary disabled" : ""
              }`}
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
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#FA5508",
            }}
            onClick={() => {
              if (searchParams.get("id")) {
                push(`/register?id=${searchParams.get("id")}`);
              } else push("/register");
            }}
          >
            Registreren
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormContent;
