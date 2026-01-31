"use client";

import { updateIsFirstTime, updateHasPostedJob } from "@/slices/userSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EscapeOnboardingPage() {
  const uid = useSelector((s) => s.user.user?.uid);
  const userType = useSelector((s) => s.user.userType);
  const dispatch = useDispatch();
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading | done | error

  useEffect(() => {
    if (!uid || userType !== "Employer") {
      setStatus("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/complete-onboarding-skip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.success) {
          dispatch(updateIsFirstTime(false));
          dispatch(updateHasPostedJob(true));
          localStorage.removeItem(`lastOnboardingPage_${uid}`);
          setStatus("done");
          router.replace("/employers-dashboard/dashboard");
        } else {
          setStatus("error");
        }
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, userType, dispatch, router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "24px",
        textAlign: "center",
      }}
    >
      {status === "loading" && <p>Taking you to the dashboard…</p>}
      {status === "done" && <p>Redirecting…</p>}
      {status === "error" && (
        <>
          <p style={{ marginBottom: "16px" }}>
            Could not complete skip. Use &quot;Skip for now&quot; on the pricing
            or post-job page, or try again later.
          </p>
          <button
            type="button"
            className="theme-btn btn-style-one"
            onClick={() => router.push("/onboard-pricing")}
          >
            Back to pricing
          </button>
        </>
      )}
    </div>
  );
}
