"use client";
import React from "react";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import OnboardBillingDetails from "./components/OnboardBillingDetails";
import OnboardOrderDetails from "./components/OnboardOrderDetails";
import OnboardPaymentOptions from "./components/OnboardPaymentOptions";

const OnboardCheckoutPage = () => {
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
                <OnboardPaymentOptions />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardCheckoutPage;
