"use client";
import React, { useState, useEffect } from "react";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/utils/stripe";
import OnboardBillingDetails from "./components/OnboardBillingDetails";
import OnboardOrderDetails from "./components/OnboardOrderDetails";
import OnboardPaymentOptions from "./components/OnboardPaymentOptions";

const OnboardCheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [orderTotal, setOrderTotal] = useState(103.95); // Default total from order details

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
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
            },
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, [orderTotal]);

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
      <header className={`header-shaddow`}>
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
                <h3 className="title">Billing Details</h3>
                <OnboardBillingDetails />
              </div>
            </div>

            <div className="column col-lg-4 col-md-12 col-sm-12">
              <OnboardOrderDetails />
              <div className="payment-box">
                {clientSecret ? (
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
                    />
                  </Elements>
                ) : (
                  <div className="loading-payment">
                    <p>Loading payment options...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardCheckoutPage;
