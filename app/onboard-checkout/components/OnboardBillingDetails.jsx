"use client";
import React from "react";
import { useRouter } from "next/navigation";

const OnboardBillingDetails = () => {
  const router = useRouter();

  const handleSubmit = () => {
    router.push("/onboard-order-completed");
  };

  return (
    <div className="default-form row">
      <div className="form-group col-lg-6 col-md-12 col-sm-12">
        <div className="field-label">
          First name <sup>*</sup>
        </div>
        <input type="text" name="first_name" placeholder="" required />
      </div>

      <div className="form-group col-lg-6 col-md-12 col-sm-12">
        <div className="field-label">
          Last name <sup>*</sup>
        </div>
        <input type="text" name="last_name" placeholder="" required />
      </div>

      <div className="form-group col-lg-12 col-md-12 col-sm-12">
        <div className="field-label">Company name</div>
        <input type="text" name="company_name" placeholder="" />
      </div>

      <div className="form-group col-lg-12 col-md-12 col-sm-12">
        <div className="field-label">
          Email Address <sup>*</sup>
        </div>
        <input type="email" name="email" placeholder="" required />
      </div>

      <div className="form-group col-lg-12 col-md-12 col-sm-12">
        <div className="field-label">
          Phone <sup>*</sup>
        </div>
        <input type="tel" name="phone" placeholder="" required />
      </div>

      <div className="form-group col-lg-12 col-md-12 col-sm-12">
        <button
          type="button"
          onClick={handleSubmit}
          className="theme-btn btn-style-one"
        >
          Complete Purchase
        </button>
      </div>
    </div>
  );
};

export default OnboardBillingDetails;
