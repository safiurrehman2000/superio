"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/utils/stripe";
import OnboardOrderDetails from "./components/OnboardOrderDetails";
import OnboardPaymentOptions from "./components/OnboardPaymentOptions";
import { useSelector } from "react-redux";

const OnboardCheckoutPage = () => {
  const searchParams = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [isPackageLoaded, setIsPackageLoaded] = useState(false);
  const { push } = useRouter();
  const selector = useSelector((store) => store.user);

  useEffect(() => {
    // Get package data from URL parameters
    const packageParam = searchParams.get("package");
    if (packageParam) {
      try {
        const packageData = JSON.parse(decodeURIComponent(packageParam));
        setSelectedPackage(packageData);

        const price =
          packageData.price === "Free" ? 0 : parseFloat(packageData.price);
        const subtotal = price;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax;
        setOrderTotal(total);
        setIsPackageLoaded(true);

        console.log("Selected package for checkout:", packageData);
        console.log("Order total:", total);
      } catch (error) {
        console.error("Error parsing package data:", error);
        setIsPackageLoaded(true); // Mark as loaded even on error
      }
    } else {
      // No package data in URL - mark as loaded to show error
      setIsPackageLoaded(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only proceed if package is loaded to prevent showing free UI prematurely
    if (!isPackageLoaded) {
      return;
    }

    // Handle free packages differently
    if (orderTotal === 0) {
      console.log("Free package selected - no payment required");
      setClientSecret("free_package"); // Special identifier for free packages
      return;
    }

    // Create payment intent when order total is available and greater than 0
    if (orderTotal > 0) {
      const createPaymentIntent = async () => {
        try {
          console.log("Creating payment intent for amount:", orderTotal);
          const response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: orderTotal,
              currency: "eur",
              metadata: {
                order_type: "onboard_plan",
                package_type: selectedPackage?.packageType || "unknown",
                userId: selector.user?.uid || "",
                packageName: selectedPackage?.name || "",
                packageId: selectedPackage?.id || "",
              },
            }),
          });

          const data = await response.json();
          console.log("Payment intent response:", data);

          if (data.clientSecret) {
            console.log(
              "Setting client secret:",
              data.clientSecret.substring(0, 20) + "..."
            );
            setClientSecret(data.clientSecret);
          } else {
            console.error("No client secret in response:", data);
            setPaymentError(data.error || "Failed to create payment intent");
          }
        } catch (error) {
          console.error("Error creating payment intent:", error);
          setPaymentError("Network error while creating payment intent");
        }
      };

      createPaymentIntent();
    }
  }, [orderTotal, selectedPackage, isPackageLoaded, selector.user?.uid]);

  const handlePaymentSuccess = (paymentIntent) => {
    console.log("Payment successful:", paymentIntent);
    // Handle successful payment - update order status, redirect, etc.
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    // Handle payment error - show error message, retry option, etc.
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <header className="header-shaddow">
        <div className="container-fluid">
          <div className="main-box">
            <div className="nav-outer">
              <div className="logo-box">
                <div className="logo text-center">
                  <Image
                    alt="brand"
                    src={LOGO}
                    width={154}
                    height={50}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="checkout-page">
        <div className="auto-container">
          <div className="row">
            <div className="column col-lg-8 col-md-12 col-sm-12">
              <div className="checkout-form">
                <h3 className="title">Payment Details</h3>
                <div className="payment-box">
                  {!isPackageLoaded ? (
                    <div
                      className="loading-package"
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                      }}
                    >
                      <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                        Loading package details...
                      </p>
                      <p style={{ fontSize: "14px", color: "#6c757d" }}>
                        Please wait while we prepare your checkout.
                      </p>
                    </div>
                  ) : !selectedPackage ? (
                    <div
                      className="no-package-error"
                      style={{
                        border: "2px solid #ffc107",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fffbf0",
                        marginBottom: "20px",
                        textAlign: "center",
                      }}
                    >
                      <h4 style={{ color: "#856404", marginBottom: "15px" }}>
                        ⚠️ No Package Selected
                      </h4>
                      <p style={{ marginBottom: "15px" }}>
                        No package was found in the URL. Please return to the
                        pricing page to select a package.
                      </p>
                      <button
                        onClick={() => push("/onboard-pricing")}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Go to Pricing
                      </button>
                    </div>
                  ) : !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                    <div
                      className="stripe-config-error"
                      style={{
                        border: "2px solid #ff6b6b",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff5f5",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ color: "#d63031", marginBottom: "15px" }}>
                        ⚠️ Stripe Configuration Required
                      </h4>
                      <p style={{ marginBottom: "15px" }}>
                        To enable payments, please add your Stripe keys to{" "}
                        <code>.env.local</code>:
                      </p>
                      <pre
                        style={{
                          background: "#f8f9fa",
                          padding: "15px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          border: "1px solid #dee2e6",
                          overflow: "auto",
                          marginBottom: "15px",
                        }}
                      >
                        {`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here`}
                      </pre>
                      <p style={{ marginBottom: "10px" }}>
                        <strong>Order Total:</strong> €{orderTotal}
                      </p>
                      <p style={{ fontSize: "14px", color: "#6c757d" }}>
                        <strong>Note:</strong> You can get these keys from your{" "}
                        <a
                          href="https://dashboard.stripe.com/apikeys"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#007bff" }}
                        >
                          Stripe Dashboard
                        </a>
                      </p>
                    </div>
                  ) : clientSecret === "free_package" ? (
                    <div
                      className="free-package-payment"
                      style={{
                        border: "2px solid #28a745",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#f8fff9",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ color: "#28a745", marginBottom: "15px" }}>
                        🎉 Free Package Selected
                      </h4>
                      <p style={{ marginBottom: "15px" }}>
                        You've selected the{" "}
                        <strong>{selectedPackage?.name}</strong> package which
                        is completely free!
                      </p>
                      <p style={{ marginBottom: "20px" }}>
                        No payment is required. Click the button below to
                        complete your order.
                      </p>
                      <button
                        onClick={() => {
                          console.log("Free package order completed");
                          handlePaymentSuccess({
                            status: "succeeded",
                            amount: 0,
                          });
                          // Redirect with payment verification parameters
                          const packageParam = encodeURIComponent(
                            JSON.stringify(selectedPackage)
                          );
                          push(
                            `/onboard-order-completed?payment_status=free_completed&order_id=free_${Date.now()}&package=${packageParam}`
                          );
                        }}
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "15px 30px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        Complete Free Order
                      </button>
                    </div>
                  ) : clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                        },
                      }}
                    >
                      <OnboardPaymentOptions
                        amount={orderTotal}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        selectedPackage={selectedPackage}
                      />
                    </Elements>
                  ) : paymentError ? (
                    <div
                      className="payment-error"
                      style={{
                        border: "2px solid #ff6b6b",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#fff5f5",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ color: "#d63031", marginBottom: "15px" }}>
                        ❌ Payment Setup Error
                      </h4>
                      <p style={{ marginBottom: "10px" }}>
                        <strong>Error:</strong> {paymentError}
                      </p>
                      <p style={{ marginBottom: "10px" }}>
                        <strong>Order Total:</strong> €{orderTotal}
                      </p>
                      <button
                        onClick={() => {
                          setPaymentError(null);
                          setClientSecret(null);
                          // Retry payment intent creation
                          if (orderTotal > 0) {
                            const createPaymentIntent = async () => {
                              try {
                                const response = await fetch(
                                  "/api/create-payment-intent",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      amount: orderTotal,
                                      currency: "eur",
                                      metadata: {
                                        order_type: "onboard_plan",
                                        package_type:
                                          selectedPackage?.packageType ||
                                          "unknown",
                                        userId: selector.user?.uid || "",
                                        packageName:
                                          selectedPackage?.name || "",
                                        packageId: selectedPackage?.id || "",
                                      },
                                    }),
                                  }
                                );
                                const data = await response.json();
                                if (data.clientSecret) {
                                  setClientSecret(data.clientSecret);
                                } else {
                                  setPaymentError(
                                    data.error ||
                                      "Failed to create payment intent"
                                  );
                                }
                              } catch (error) {
                                setPaymentError(
                                  "Network error while creating payment intent"
                                );
                              }
                            };
                            createPaymentIntent();
                          }
                        }}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Retry Payment Setup
                      </button>
                    </div>
                  ) : (
                    <div className="loading-payment">
                      <p>
                        {orderTotal === 0
                          ? "Setting up free package..."
                          : "Loading payment options..."}
                      </p>
                      <p>Order Total: €{orderTotal}</p>
                      <p>
                        Package:{" "}
                        {selectedPackage?.name || "No package selected"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="column col-lg-4 col-md-12 col-sm-12">
              <OnboardOrderDetails selectedPackage={selectedPackage} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardCheckoutPage;
