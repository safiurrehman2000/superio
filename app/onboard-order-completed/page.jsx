"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import OnboardOrderCompleted from "./components/OnboardOrderCompleted";

export default function page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const selector = useSelector((store) => store.user);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Check if user is authenticated
      if (!selector.user?.uid) {
        console.log("User not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      // Check for payment verification parameters
      const paymentStatus = searchParams.get("payment_status");
      const orderId = searchParams.get("order_id");
      const packageData = searchParams.get("package");
      const paymentIntent = searchParams.get("payment_intent");
      const paymentIntentClientSecret = searchParams.get(
        "payment_intent_client_secret"
      );
      const sessionId = searchParams.get("session_id");

      // Allow access if payment was successful or if it's a free package
      if (paymentStatus === "succeeded" || paymentStatus === "free_completed") {
        console.log("Payment verified via custom parameters, allowing access");
        setIsAuthorized(true);
      } else if (orderId && packageData) {
        // Additional verification could be done here with backend
        console.log("Order ID present, allowing access");
        setIsAuthorized(true);
      } else if (sessionId) {
        // Stripe redirect - verify the session
        console.log("Stripe session_id detected, verifying session");
        try {
          const response = await fetch("/api/check-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();
          if (data.session && data.session.payment_status === "paid") {
            console.log("Stripe session verified successfully");
            setIsAuthorized(true);
          } else {
            console.log("Stripe session verification failed");
            router.push("/onboard-pricing");
            return;
          }
        } catch (error) {
          console.error("Error verifying Stripe session:", error);
          router.push("/onboard-pricing");
          return;
        }
      } else if (paymentIntent && paymentIntentClientSecret) {
        // Stripe redirect - verify the payment intent
        console.log("Stripe redirect detected, verifying payment intent");
        try {
          const response = await fetch("/api/verify-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent,
              clientSecret: paymentIntentClientSecret,
            }),
          });

          const data = await response.json();
          if (data.verified && data.status === "succeeded") {
            console.log("Payment intent verified successfully");
            setIsAuthorized(true);
          } else {
            console.log("Payment intent verification failed");
            router.push("/onboard-pricing");
            return;
          }
        } catch (error) {
          console.error("Error verifying payment intent:", error);
          router.push("/onboard-pricing");
          return;
        }
      } else {
        console.log("No payment verification found, redirecting to pricing");
        router.push("/onboard-pricing");
        return;
      }

      setIsLoading(false);
    };

    checkAuthorization();
  }, [router, searchParams, selector.user]);

  if (isLoading) {
    return (
      <section className="order-confirmation">
        <div className="auto-container">
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <p>Verifying your order...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthorized) {
    return (
      <section className="order-confirmation">
        <div className="auto-container">
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <p>Access denied. Please complete your order first.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-confirmation">
      <div className="auto-container">
        <OnboardOrderCompleted />
      </div>
    </section>
  );
}
