"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateIsFirstTime } from "@/APIs/auth/database";
import { updateIsFirstTime } from "@/slices/userSlice";
import OnboardOrderInfo from "./OnboardOrderInfo";
import OnboardOrderTable from "./OnboardOrderTable";
import { useCreateJobPost } from "@/APIs/auth/jobs";

const index = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [jobSubmitted, setJobSubmitted] = useState(false);
  const [jobError, setJobError] = useState(null);
  const jobSubmissionRef = useRef(false);

  useEffect(() => {
    const getPackageData = () => {
      const packageParam = searchParams.get("package");
      if (packageParam) {
        try {
          const packageInfo = JSON.parse(decodeURIComponent(packageParam));
          setPackageData(packageInfo);
        } catch (error) {
          console.error("Error parsing package data:", error);
        }
      }
    };

    getPackageData();
  }, [searchParams]);

  useEffect(() => {
    // On mount, check for pending job post in localStorage and submit it
    const submitPendingJob = async () => {
      // Prevent multiple submissions using ref
      if (jobSubmissionRef.current) return;

      const pendingJob = localStorage.getItem(
        `pendingJobPost_${selector.user?.uid}`
      );
      if (pendingJob && selector.user?.uid) {
        jobSubmissionRef.current = true;
        setIsLoading(true);
        setJobError(null);
        try {
          const payload = JSON.parse(pendingJob);
          // Ensure employerId is correct
          payload.employerId = selector.user.uid;
          const { success, error } = await useCreateJobPost(payload);
          if (success) {
            setJobSubmitted(true);
            localStorage.removeItem(`pendingJobPost_${selector.user.uid}`);
          } else {
            setJobError(error || "Failed to submit job after payment.");
          }
        } catch (err) {
          setJobError(err.message || "Failed to submit job after payment.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setJobSubmitted(true); // No pending job, allow proceeding
      }
    };
    submitPendingJob();
  }, []); // Remove dependencies to ensure it only runs once

  const handleProceedToProfile = async () => {
    try {
      setIsLoading(true);
      // Update isFirstTime to false and hasPostedJob to true so user can proceed
      await useUpdateIsFirstTime(selector.user.uid, { hasPostedJob: true });

      // Update Redux store
      dispatch(updateIsFirstTime(false));

      // Clear any remaining localStorage data to prevent going back
      localStorage.removeItem(`pendingJobPost_${selector.user.uid}`);
      localStorage.removeItem(`lastOnboardingPage_${selector.user.uid}`);

      // Redirect to profile creation
      router.push("/create-profile-employer");
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="upper-box">
        <span className="icon fa fa-check"></span>
        <h4>Your order is completed!</h4>
        <div className="text">
          Thank you. Your order for{" "}
          <strong>{packageData?.name || "the selected package"}</strong> has
          been received.
        </div>
        {jobError && (
          <div style={{ color: "red", marginTop: 8 }}>{jobError}</div>
        )}
        <button
          style={{ marginTop: "12px" }}
          className="theme-btn btn-style-one"
          onClick={handleProceedToProfile}
          disabled={isLoading || !jobSubmitted}
        >
          {isLoading
            ? "Submitting Job..."
            : !jobSubmitted
            ? "Please wait..."
            : "Proceed to your dashboard"}
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
