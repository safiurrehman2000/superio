"use client";
import { useUpdateUserInfo } from "@/APIs/auth/database";
import LogoUpload from "@/components/dashboard-pages/candidates-dashboard/my-profile/components/my-profile/LogoUpload";
import { FormProvider, useForm } from "react-hook-form";
import FormInfoBox from "./FormInfoBox";
import { useState } from "react";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "@/slices/userSlice";

const index = () => {
  const selector = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const { updateUserInfo } = useUpdateUserInfo();
  const [loading, setLoading] = useState(false);
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      logo: selector?.user?.logo || null,
      company_name: selector?.user?.company_name || "",
      email: selector?.user?.email || "",
      phone: selector?.user?.phone || "",
      website: selector?.user?.website || "",
      company_type: selector?.user?.company_type || [],
      description: selector?.user?.description || "",
      company_location: selector?.user?.company_location || "",
    },
  });

  const { handleSubmit, setError } = methods;
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (!selector.user.uid) {
        throw new Error("User ID is not available");
      }
      if (!selector.userType) {
        throw new Error("User type is not available in Redux store");
      }
      await updateUserInfo(data, selector.user.uid, selector.userType);

      const updatedUser = {
        ...selector.user,
        ...data,
        userType: selector.userType,
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="widget-content">
          <LogoUpload />
          <FormInfoBox />
          {/* compnay info box */}
          <div className="form-group col-lg-6 col-md-12">
            <button
              className={`theme-btn ${
                loading ? "btn-style-three" : "btn-style-one"
              }`}
            >
              {loading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {" "}
                  <CircularLoader /> <p style={{ margin: 0 }}>Saving...</p>{" "}
                </div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default index;
