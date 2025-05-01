"use client";
import { checkValidDetails } from "@/utils/validate";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseErrorMessage } from "@/utils/constants";

const FormContent = () => {
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { push } = useRouter();

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const validationErrors = checkValidDetails(newEmail, password);
    setErrors(validationErrors || {});
    setApiError("");
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationErrors = checkValidDetails(email, newPassword);
    setErrors(validationErrors || {});
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = checkValidDetails(email, password);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true); //loading state to disable button
    setApiError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      push("/login");
      const user = userCredential.user;
    } catch (error) {
      setApiError(getFirebaseErrorMessage(error));
    } finally {
      setIsLoading(false); //resetting loading state and forms
      if (apiError) {
        setEmail("");
        setPassword("");
        setErrors({});
      }
    }
  };
  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e);
      }}
      method="post"
      action="add-parcel.html"
    >
      <div className="form-group">
        <label>Email Address</label>
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
      {/* name */}

      <div className="form-group">
        <label>Password</label>
        <input
          onChange={(e) => {
            handlePasswordChange(e);
          }}
          id="password-field"
          type="password"
          name="password"
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-danger mt-2">{errors.password}</p>
        )}
      </div>
      {/* password */}

      <div className="form-group">
        <button
          disabled={isLoading}
          className={`theme-btn btn-style-one btn ${
            isLoading ? "btn-secondary disabled" : ""
          }`}
          type="submit"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
        {apiError != " " && (
          <p className="text-center text-danger mt-2">{apiError}</p>
        )}
      </div>
      {/* login */}
    </form>
  );
};

export default FormContent;
