"use client";
import { FormProvider, useForm } from "react-hook-form";
import FormInfoBox from "./FormInfoBox";
import LogoUpload from "./LogoUpload";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserInfo } from "@/APIs/auth/database";

const Index = () => {
  const { updateUserInfo } = useUpdateUserInfo();
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);
  const userId = selector?.user.uid;
  const userType = selector?.userType;

  const methods = useForm({
    defaultValues: {
      logo: null,
      name: "",
      title: "",
      phone_number: "",
      email: "",
      gender: "",
      age: "",
      profile_visibility: "",
      description: "",
    },
  });
  const { handleSubmit, setError } = methods;

  const onSubmit = async (data) => {
    try {
      console.log("Form Data Submitted:", data);
      if (!userId) {
        throw new Error("User ID is not available");
      }
      if (!userType) {
        throw new Error("User type is not available in Redux store");
      }
      await updateUserInfo(data, userId, userType);
      const updatedUser = {
        ...selector.user,
        ...updateData,
        userType,
      };
      dispatch(addUser(updatedUser));
      console.log("User info updated successfully");
    } catch (error) {
      console.error("Submission error:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Failed to update user info",
      });
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
            <button type="submit" className="theme-btn btn-style-one">
              Save
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
