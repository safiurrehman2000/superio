"use client";
import { useUpdateUserInfo } from "@/APIs/auth/database";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { addUser } from "@/slices/userSlice";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import FormInfoBox from "./FormInfoBox";
import LogoUpload from "./LogoUpload";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const { updateUserInfo } = useUpdateUserInfo();
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);
  const userId = selector?.user?.uid;
  const userType = selector?.userType;

  const methods = useForm({
    defaultValues: {
      logo: selector.user?.logo || null,
      name: selector.user?.name || "",
      title: selector.user?.title || "",
      phone_number: selector.user?.phone_number || "",
      email: selector.user?.email || "",
      gender: selector.user?.gender || "",
      age: selector.user?.age || "",
      profile_visibility: selector.user?.profile_visibility || "",
      description: selector.user?.description || "",
    },
  });
  const { handleSubmit, setError } = methods;

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (!userId) {
        throw new Error("User ID is not available");
      }
      if (!userType) {
        throw new Error("User type is not available in Redux store");
      }
      await updateUserInfo(data, userId, userType);
      const updatedUser = {
        ...selector.user,
        ...data,
        userType,
      };
      dispatch(addUser(updatedUser));
    } catch (error) {
      console.error("Submission error:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Failed to update user info",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-content">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <LogoUpload />
          <FormInfoBox />
          <div
            className="form-group col-md-12"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <button
              type="submit"
              className={`theme-btn ${
                loading ? "btn-style-three" : "btn-style-one"
              }`}
            >
              {loading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularLoader />
                  <p style={{ margin: 0 }}>Saving...</p>
                </div>
              ) : (
                "Save"
              )}
            </button>
          </div>
          {methods.formState.errors.root && (
            <p className="text-danger mt-2">
              {methods.formState.errors.root.message}
            </p>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default Index;
