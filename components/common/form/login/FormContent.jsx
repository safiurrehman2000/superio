"use client";
import { useLogIn } from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { InputField } from "@/components/inputfield/InputField";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const FormContent = () => {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const searchParams = useSearchParams();
  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = methods;
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { push } = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");

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
      <h3 className="text-center">Login to Flexijobber</h3>

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
            label="Email"
            name="email"
            type="email"
            placeholder="Email"
            required
            fieldType="Email"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            required
            fieldType="Password"
          />
          <div className="form-group">
            <div className="field-outer">
              <div className="input-group checkboxes square">
                <input type="checkbox" name="remember-me" id="remember" />
                <label htmlFor="remember" className="remember">
                  <span className="custom-checkbox"></span> Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="pwd"
                style={{ textDecoration: "underline", color: "#fa5508" }}
              >
                Forgot password?
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
                    Logging in...
                  </p>
                </div>
              ) : (
                "Login"
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
          Don't have an account?&nbsp;
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
            Signup
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormContent;
