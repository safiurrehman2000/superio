"use client";
import { useSignUp } from "@/APIs/auth/user";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { checkValidDetails } from "@/utils/validate";
import { useState } from "react";

const FormContent = () => {
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
    setIsLoading(true);
    setApiError("");

    const result = await useSignUp(email, password);

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      } else if (result.apiError) {
        setApiError(result.apiError);
        setEmail("");
        setPassword("");
        setErrors({});
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // push("/login");
  };

  return (
    <form onSubmit={handleSubmit} method="post" action="add-parcel.html">
      <div className="form-group">
        <label>Email Address</label>
        <input
          onChange={handleEmailChange}
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          required
        />
        {errors.email && <p className="text-danger mt-2">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          onChange={handlePasswordChange}
          id="password-field"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
        />
        {errors.password && (
          <p className="text-danger mt-2">{errors.password}</p>
        )}
      </div>

      <div className="form-group">
        <button
          disabled={isLoading}
          className={`theme-btn btn-style-one btn ${
            isLoading ? "btn-secondary disabled" : ""
          }`}
          type="submit"
        >
          {isLoading ? (
            <div className="d-flex justify-content-center gap-2 align-items-center">
              <CircularLoader size={24} strokeColor="#000" />
              <p className={isLoading ? "text-black" : "text-white"}>
                Registering...
              </p>
            </div>
          ) : (
            "Register"
          )}
        </button>
        {apiError && <p className="text-center text-danger mt-2">{apiError}</p>}
      </div>
    </form>
  );
};

export default FormContent;
