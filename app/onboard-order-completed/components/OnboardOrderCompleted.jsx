"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateIsFirstTime } from "@/APIs/auth/database";
import { updateIsFirstTime } from "@/slices/userSlice";

const index = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleProceedToDashboard = async () => {
    try {
      setIsLoading(true);

      await useUpdateIsFirstTime(selector.user.uid);

      dispatch(updateIsFirstTime(false));

      router.push("/employers-dashboard/dashboard");
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="upper-box"
        style={{ textAlign: "center", padding: "50px 20px" }}
      >
        <span className="icon fa fa-check"></span>
        <h4>Betaling voltooid!</h4>
        <div className="text" style={{ marginTop: "20px", fontSize: "16px" }}>
          U kunt uw factuur downloaden vanuit uw dashboard.
        </div>
        <button
          style={{ marginTop: "30px" }}
          className="theme-btn btn-style-one"
          onClick={handleProceedToDashboard}
          disabled={isLoading}
        >
          {isLoading ? "Laden..." : "Ga naar dashboard"}
        </button>
      </div>
    </>
  );
};

export default index;
