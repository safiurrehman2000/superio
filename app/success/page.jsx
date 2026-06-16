"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/utils/firebase";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || syncedRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        if (typeof auth.authStateReady === "function") {
          await auth.authStateReady();
        }
      } catch {
        /* ignore */
      }
      const user = auth.currentUser;
      if (!user || cancelled) return;

      try {
        await fetch("/api/check-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const token = await user.getIdToken();
        const res = await fetch("/api/sync-checkout-receipt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        syncedRef.current = true;
        if (!res.ok) {
          console.warn("sync-checkout-receipt:", res.status, data);
        }
      } catch (e) {
        console.warn("checkout activation failed", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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
