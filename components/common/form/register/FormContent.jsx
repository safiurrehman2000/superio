import { checkValidDetails } from "@/utils/validate";
import { useState } from "react";

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
        <button className="theme-btn btn-style-one" type="submit">
          Register
        </button>
      </div>
      {/* login */}
    </form>
  );
};

export default FormContent;
