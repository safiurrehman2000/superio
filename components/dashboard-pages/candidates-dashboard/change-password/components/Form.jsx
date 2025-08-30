"use client";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { auth } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const Form = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const selector = useSelector((store) => store.user);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const { handleSubmit, watch } = methods;
  const newPassword = watch("new_password");

  const onSubmit = async (data) => {
    const { old_password, new_password, confirm_password } = data;
    setError("");
    setSuccess("");

    // Validation
    if (new_password !== confirm_password) {
      errorToast("New passwords don't match");
      return;
    }

    if (new_password?.length < 6) {
      errorToast("Password should be at least 6 characters");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser || !selector.user?.email) {
      errorToast("No user is signed in");
      return;
    }

    try {
      setIsLoading(true);

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        selector.user.email,
        old_password
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, new_password);

      successToast("Password updated successfully!");

      // Clear form
      methods.reset();
    } catch (err) {
      console.error("Error updating password:", err);
      errorToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="row default-form">
          {/* Current Password */}
          <div className="form-group col-lg-7 col-md-12">
            <InputField
              type="password"
              name="old_password"
              label="Current Password"
              placeholder="Enter your current password"
              fieldType="Password"
              validation={{
                required: "Current password is required",
              }}
            />
          </div>

          {/* New Password */}
          <div className="form-group col-lg-7 col-md-12">
            <InputField
              name="new_password"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              fieldType="Password"
              validation={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
            />
          </div>

          {/* Confirm New Password */}
          <div className="form-group col-lg-7 col-md-12">
            <InputField
              name="confirm_password"
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              fieldType="Password"
              validation={{
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords don't match",
              }}
            />
          </div>

          {/* Submit Button */}
          <div className="form-group col-lg-6 col-md-12">
            <button
              type="submit"
              className={`theme-btn ${
                isLoading ? "btn-style-three" : "btn-style-one"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {" "}
                  <CircularLoader /> <p style={{ margin: 0 }}>Updating...</p>
                </div>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default Form;
