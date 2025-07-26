"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "pricing";

  useEffect(() => {
    // Auto redirect to employers dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/employers-dashboard/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>Subscription Successful!</h1>
      <p>Your subscription has been processed successfully.</p>
      <p style={{ color: "#666", marginTop: 16 }}>
        Redirecting to dashboard in 3 seconds...
      </p>
      <button
        style={{
          background: "#fa5508",
          color: "#fff",
          border: "none",
          padding: "12px 32px",
          borderRadius: 6,
          fontWeight: 600,
          marginTop: 32,
          cursor: "pointer",
        }}
        onClick={() => router.push("/employers-dashboard/dashboard")}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
