"use client";
import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import Image from "next/image";
import { useState } from "react";
import { checkValidDetails } from "@/utils/validate";

const FormContent = () => {
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const validationErrors = checkValidDetails(newEmail, password);
    setErrors(validationErrors || {});
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationErrors = checkValidDetails(email, newPassword);
    setErrors(validationErrors || {});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = checkValidDetails(email, password);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
  };
  return (
    <div className="form-inner">
      <div className="text-center mb-5">
        <Image
          width={154}
          height={50}
          src="/images/logo-deflexijobber.png"
          alt="De Flexijobber Logo"
        />
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
            className="theme-btn btn-style-one"
            type="submit"
            name="log-in"
          >
            Log In
          </button>
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account? <Link href="/register">Signup</Link>
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

export default FormContent;
