"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const OnboardPaymentOptions = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  selectedPackage,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Initialize Payment Request for Apple Pay / Google Pay
  useEffect(() => {
    if (stripe && amount) {
      const pr = stripe.paymentRequest({
        country: "BE",
        currency: "eur",
        total: {
          label: "Superio Plan Purchase",
          amount: Math.round(amount * 100), // Convert to cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on("paymentmethod", async (event) => {
        setIsProcessing(true);
        setError(null);

        try {
          const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/onboard-order-completed`,
            },
            redirect: "if_required",
          });

          if (confirmError) {
            setError(confirmError.message);
            onPaymentError?.(confirmError);
            event.complete("fail");
          } else {
            onPaymentSuccess?.(event.paymentMethod);
            event.complete("success");
            // Stripe will handle the redirect automatically
            // The return_url in confirmPayment will redirect to order completed page
          }
        } catch (err) {
          setError("An unexpected error occurred.");
          onPaymentError?.(err);
          event.complete("fail");
        } finally {
          setIsProcessing(false);
        }
      });
    }
  }, [stripe, amount, elements, router, onPaymentSuccess, onPaymentError]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (paymentMethod === "card") {
        const { error: stripeError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/onboard-order-completed`,
            },
          });

        if (stripeError) {
          setError(stripeError.message);
          onPaymentError?.(stripeError);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          onPaymentSuccess?.(paymentIntent);
          // Stripe will handle the redirect automatically
          // The return_url in confirmPayment will redirect to order completed page
        }
      } else if (paymentMethod === "paypal") {
        // Handle PayPal payment
        console.log("PayPal payment selected");
        // You would integrate PayPal here
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format amount for Euro display
  const formatEuroAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="payment-options">
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && (
        <div className="digital-wallet-payment">
          <button
            type="button"
            className="payment-request-button"
            onClick={() => paymentRequest?.show()}
            disabled={isProcessing}
          >
            {paymentRequest?.canMakePayment()?.applePay
              ? "Pay with Apple Pay"
              : paymentRequest?.canMakePayment()?.googlePay
              ? "Pay with Google Pay"
              : "Pay with Digital Wallet"}
          </button>
          <div className="divider">
            <span>or</span>
          </div>
        </div>
      )}

      <ul>
        <li>
          <div className="radio-option radio-box">
            <input
              type="radio"
              name="payment-group"
              id="payment-1"
              checked={paymentMethod === "card"}
              onChange={() => handlePaymentMethodChange("card")}
            />
            <label htmlFor="payment-1">
              Credit Card
              <span className="small-text">
                Pay securely using your credit card.
              </span>
            </label>
          </div>
        </li>

        <li>
          <div className="radio-option radio-box">
            <input
              type="radio"
              name="payment-group"
              id="payment-2"
              checked={paymentMethod === "paypal"}
              onChange={() => handlePaymentMethodChange("paypal")}
            />
            <label htmlFor="payment-2">
              <strong>PayPal</strong>
              <Image
                width={90}
                height={23}
                src="/images/icons/paypal.png"
                alt="paypal"
              />
            </label>
          </div>
        </li>
      </ul>

      {paymentMethod === "card" && (
        <div className="card-details">
          <div className="form-group">
            <label>Payment Details</label>
            <div className="stripe-payment-element">
              <PaymentElement />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="error-message"
          style={{ color: "red", marginTop: "10px" }}
        >
          {error}
        </div>
      )}

      <div className="btn-box">
        <button
          type="submit"
          className="theme-btn btn-style-one"
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          style={{ width: "100%" }}
        >
          {isProcessing
            ? "Processing..."
            : `Pay ${formatEuroAmount(amount || 0)}`}
        </button>
      </div>
    </div>
  );
};

export default OnboardPaymentOptions;
