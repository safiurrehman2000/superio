"use client";
import React, { useState } from "react";

const OnboardCoupon = () => {
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Add coupon logic here
    console.log("Applying coupon:", couponCode);
  };

  return (
    <div className="apply-coupon">
      <div className="form-group">
        <input
          type="text"
          name="coupon-code"
          className="input"
          placeholder="Coupon Code"
        />
      </div>

      <div className="form-group">
        <button type="button" className="theme-btn btn-style-one">
          Apply Coupon
        </button>
      </div>

      <div className="form-group pull-right">
        <button type="button" className="theme-btn btn-style-three">
          update cart
        </button>
      </div>
    </div>
  );
};

export default OnboardCoupon;
