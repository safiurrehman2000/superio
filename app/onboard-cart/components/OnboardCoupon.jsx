"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const OnboardCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();

  // const handleApplyCoupon = (e) => {
  //   e.preventDefault();
  //   // Add coupon logic here
  //   console.log("Applying coupon:", couponCode);
  // };

  const handleChangePlan = () => {
    // Navigate back to the pricing page
    router.push("/onboard-pricing");
  };

  return (
    <div className="apply-coupon">
      {/* <div className="form-group">
        <input
          type="text"
          name="coupon-code"
          className="input"
          placeholder="Coupon Code"
        />
      </div> */}

      {/* <div className="form-group">
        <button type="button" className="theme-btn btn-style-one">
          Apply Coupon
        </button>
      </div> */}

      <div className="form-group pull-right">
        <button
          type="button"
          className="theme-btn btn-style-three"
          onClick={handleChangePlan}
        >
          Change Plan
        </button>
      </div>
    </div>
  );
};

export default OnboardCoupon;
