"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateIsFirstTime } from "@/APIs/auth/database";
import { updateIsFirstTime } from "@/slices/userSlice";
import OnboardOrderInfo from "./OnboardOrderInfo";
import OnboardOrderTable from "./OnboardOrderTable";

const index = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);

  const handleProceedToProfile = async () => {
    try {
      // Update isFirstTime to false so user can proceed to profile creation
      await useUpdateIsFirstTime(selector.user.uid);

      // Update Redux store
      dispatch(updateIsFirstTime(false));

      // Redirect to profile creation
      router.push("/create-profile-employer");
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <>
      <div className="upper-box">
        <span className="icon fa fa-check"></span>
        <h4>Your order is completed!</h4>
        <div className="text">Thank you. Your order has been received.</div>
        <button
          style={{ marginTop: "12px" }}
          className="theme-btn btn-style-one"
          onClick={handleProceedToProfile}
        >
          Proceed to posting a job
        </button>
      </div>
      {/* End upper-box */}

      <OnboardOrderInfo />
      {/* <!--Order Box--> */}

      <div className="order-box">
        <h3>Order details</h3>
        <OnboardOrderTable />
      </div>

      {/* <!--End Order Box--> */}
    </>
  );
};

export default index;
