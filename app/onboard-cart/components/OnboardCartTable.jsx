"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import OnboardCartItems from "./OnboardCardItems";

const OnboardCartTable = ({ selectedPackage }) => {
  const router = useRouter();
  const selector = useSelector((store) => store.user);

  const handleContinue = () => {
    // After successful payment, redirect to profile creation
    router.push("/create-profile-employer");
  };

  return (
    <table className="default-table ">
      <thead className="cart-header">
        <tr>
          <th className="product-name">Product</th>

          <th className="product-price">Price</th>
          <th className="product-subtotal">Subtotal</th>
          <th className="product-remove">&nbsp;</th>
        </tr>
      </thead>
      {/* End thead */}

      <tbody>
        <OnboardCartItems selectedPackage={selectedPackage} />
      </tbody>
      {/* End tbody */}
    </table>
  );
};

export default OnboardCartTable;
