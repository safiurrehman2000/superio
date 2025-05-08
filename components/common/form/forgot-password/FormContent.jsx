"use client";
import { useForgetPassword } from "@/APIs/auth/auth";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const FormContent2 = () => {
  const { push } = useRouter();
  const methods = useForm({ defaultValues: { email: "" }, mode: "onChange" });
  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading((prev) => !prev);
    const { success } = await useForgetPassword(data.email);
    setLoading((prev) => !prev);
    if (success) {
      push("/login");
    }
  };
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-inner">
          <div className="text-center mb-5">
            <Image
              width={154}
              height={50}
              src={LOGO}
              alt="De Flexijobber Logo"
            />
          </div>
          <h3 className="text-center">Forgot Password</h3>
          {/* <!--Login Form--> */}

          <div className="form-group">
            <InputField
              name="email"
              fieldType="Email"
              required
              label="Type your email to reset your password"
            />
          </div>
          {/* name */}

          <div className="form-group">
            <button
              disabled={loading || !isValid}
              className={`theme-btn btn-style-one btn ${
                loading ? "btn-secondary disabled" : ""
              }`}
              type="submit"
              name="reset-password"
              style={{
                cursor: loading || !isValid ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <div className="d-flex justify-content-center gap-2">
                  <CircularLoader />
                  <p className={`${loading ? "text-black" : "text-white"}`}>
                    Sending Link...
                  </p>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
          {/* login */}

          {/* End form */}

          {/* End bottom-box LoginWithSocial */}
        </div>
      </form>
    </FormProvider>
  );
};

export default FormContent2;
