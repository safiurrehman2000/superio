"use client";

import { updateIsFirstTime, updateHasPostedJob } from "@/slices/userSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SkipOnboardingLink() {
  const uid = useSelector((s) => s.user.user?.uid);
  const userType = useSelector((s) => s.user.userType);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!uid || userType !== "Employer") return null;

  const handleSkip = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/complete-onboarding-skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        dispatch(updateIsFirstTime(false));
        dispatch(updateHasPostedJob(true));
        localStorage.removeItem(`lastOnboardingPage_${uid}`);
        router.push("/employers-dashboard/dashboard");
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Skip onboarding:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      disabled={loading}
      className="theme-btn btn-style-one"
      style={{
        marginBottom: "16px",
        opacity: loading ? 0.7 : 1,
        fontSize: "14px",
      }}
    >
      {loading ? "Continuing…" : "Skip for now — go to dashboard"}
    </button>
  );
}
