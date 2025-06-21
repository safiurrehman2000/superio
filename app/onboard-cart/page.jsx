import React from "react";
import OnboardCartTable from "./components/OnboardCartTable";
import OnboardCoupon from "./components/OnboardCoupon";
import OnboardCartTotal from "./components/OnboardCartTotal";
import { LOGO } from "@/utils/constants";
import Image from "next/image";

const OnboardCartPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <header className={`header-shaddow }`}>
        <div className="container-fluid">
          {/* <!-- Main box --> */}
          <div className="main-box">
            {/* <!--Nav Outer --> */}
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
              {/* End .logo-box */}

              {/* <!-- Main Menu End--> */}
            </div>
            {/* End .nav-outer */}

            {/* End outer-box */}
          </div>
        </div>
      </header>{" "}
      <section className="cart-section">
        <div className="auto-container">
          <div className="row">
            <div className="column col-lg-8 col-md-12 col-sm-12">
              {/* <!--Cart Outer--> */}
              <div className="cart-outer">
                <div className="table-outer">
                  <OnboardCartTable />
                </div>
                {/* End table-outer */}

                <div className="cart-options clearfix">
                  <OnboardCoupon />
                </div>
                {/* End coupon */}
              </div>
              {/* End .cart-outer */}
            </div>
            {/* End .col-lg-8 */}

            <div className="column col-lg-4 col-md-12 col-sm-12">
              <OnboardCartTotal />
            </div>
            {/* End .col-lg-4 */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardCartPage;
