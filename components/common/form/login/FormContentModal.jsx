"use client";
import { checkValidDetails } from "@/utils/validate";
import Image from "next/image";
import { useState } from "react";
import LoginWithSocial from "./LoginWithSocial";

import CircularLoader from "@/components/circular-loading/CircularLoading";
import { getFirebaseErrorMessage, LOGO } from "@/utils/constants";
import { auth } from "@/utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const FormContentModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { push } = useRouter();

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const validationErrors = checkValidDetails(newEmail, password, "email");
    setErrors(validationErrors || {});
    setApiError("");
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationErrors = checkValidDetails(email, newPassword, "password");
    setErrors(validationErrors || {});
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErrors = checkValidDetails(email, password, "email");
    const passwordErrors = checkValidDetails(email, password, "password");
    const validationErrors = { ...emailErrors, ...passwordErrors };

    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setApiError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      push("/");
    } catch (error) {
      setApiError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
      if (apiError) {
        setEmail("");
        setPassword("");
        setErrors({});
      }
    }
  };

  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image width={154} height={50} src={LOGO} alt="De Flexijobber Logo" />
      </div>
      <h3 className="text-center">Login to Flexijobber</h3>

      {/* <!--Login Form--> */}
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        method="post"
      >
        <div className="form-group">
          <label>Email</label>
          <input
            onChange={(e) => {
              handleEmailChange(e);
            }}
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          {errors.email && <p className="text-danger mt-2">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            onChange={(e) => {
              handlePasswordChange(e);
            }}
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        {/* password */}

        <div className="form-group">
          <div className="field-outer">
            <div className="input-group checkboxes square">
              <input type="checkbox" name="remember-me" id="remember" />
              <label htmlFor="remember" className="remember">
                <span className="custom-checkbox"></span> Remember me
              </label>
            </div>
            <a href="/forgot-password" className="pwd">
              Forgot password?
            </a>
          </div>
        </div>
        {/* forgot password */}

        <div className="form-group">
          <button
            disabled={isLoading}
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
          {apiError != " " && (
            <p className="text-center text-danger mt-2">{apiError}</p>
          )}
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text d-flex justify-content-center">
          Don&apos;t have an account?&nbsp;
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              push("/register");
            }}
          >
            {""} Signup
          </div>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default FormContentModal;
