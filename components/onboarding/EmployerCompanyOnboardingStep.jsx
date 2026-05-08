"use client";

import { useUpdateUserInfo } from "@/APIs/auth/database";
import LogoUpload from "@/components/dashboard-pages/candidates-dashboard/my-profile/components/my-profile/LogoUpload";
import FormInfoBox from "@/components/dashboard-pages/employers-dashboard/company-profile/components/my-profile/FormInfoBox";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "@/slices/userSlice";

export default function EmployerCompanyOnboardingStep() {
  const selector = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const router = useRouter();
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
      if (!selector.user?.uid) {
        throw new Error("User ID is not available");
      }
      if (!selector.userType) {
        throw new Error("User type is not available");
      }
      await updateUserInfo(data, selector.user.uid, selector.userType);

      const updatedUser = {
        ...selector.user,
        ...data,
        userType: selector.userType,
      };
      dispatch(addUser(updatedUser));

      router.push("/onboard-pricing");
    } catch (error) {
      console.error("Employer onboarding company step:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Failed to save company information",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit(onSubmit)();
          }
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="widget-content">
          <p style={{ marginBottom: "20px" }}>
            Complete your company details before choosing a subscription. This
            information is used for your Stripe invoices and billing.
          </p>
          <LogoUpload />
          <FormInfoBox />
          <div className="form-group col-lg-6 col-md-12">
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
                  <p style={{ margin: 0 }}>Saving…</p>
                </div>
              ) : (
                "Continue to subscription"
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
