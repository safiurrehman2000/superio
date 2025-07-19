"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "pricing";

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>Subscription Successful!</h1>
      <p>Your subscription has been processed successfully.</p>
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
        onClick={() => router.push("/employers-dashboard/packages")}
      >
        Go to My Packages
      </button>
    </div>
  );
}
