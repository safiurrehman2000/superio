"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "pricing";

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>Payment Failed</h1>
      <p>There was a problem processing your payment. Please try again.</p>
      <button
        style={{
          background: "#d32f2f",
          color: "#fff",
          border: "none",
          padding: "12px 32px",
          borderRadius: 6,
          fontWeight: 600,
          marginTop: 32,
          cursor: "pointer",
        }}
        onClick={() =>
          router.push(
            source === "onboarding"
              ? "/onboard-pricing"
              : "/employers-dashboard/packages"
          )
        }
      >
        {source === "onboarding"
          ? "Back to Onboarding Pricing"
          : "Back to My Packages"}
      </button>
    </div>
  );
}
