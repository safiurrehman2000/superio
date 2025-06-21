"use client";
import React from "react";
import Image from "next/image";

const OnboardPaymentOptions = () => {
  return (
    <div className="payment-options">
      <ul>
        <li>
          <div className="radio-option radio-box">
            <input
              type="radio"
              name="payment-group"
              id="payment-1"
              defaultChecked
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
            <input type="radio" name="payment-group" id="payment-2" />
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

      <div className="card-details">
        <div className="form-group">
          <label>Card Number</label>
          <input type="text" placeholder="1234 5678 9012 3456" />
        </div>
        <div className="row">
          <div className="form-group col-6">
            <label>Expiry Date</label>
            <input type="text" placeholder="MM/YY" />
          </div>
          <div className="form-group col-6">
            <label>CVV</label>
            <input type="text" placeholder="123" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardPaymentOptions;
