"use client";
import React from "react";
import { useRouter } from "next/navigation";

const OnboardCartTotal = () => {
  const router = useRouter();

  // Dummy cart data - in real app, this would come from props or context
  const cartItems = [
    {
      id: 1,
      title: "Basic Plan",
      price: 99,
      qty: 1,
    },
  ];

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    // Add payment processing logic here
    console.log("Processing payment...");
    // After successful payment
    router.push("/onboard-checkout");
  };

  return (
    <div className="totals-table-outer">
      <ul className="totals-table">
        <li>
          <h3>Cart Totals</h3>
        </li>

        <li>
          <span className="col">Subtotal</span>
          <span className="col price">${subtotal.toFixed(2)}</span>
        </li>
        <li>
          <span className="col">Tax (5%)</span>
          <span className="col price">${tax.toFixed(2)}</span>
        </li>

        <li>
          <span className="col">Total</span>
          <span className="col price">${total.toFixed(2)}</span>
        </li>
      </ul>

      <button
        type="submit"
        className="theme-btn btn-style-one proceed-btn"
        onClick={handleCheckout}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default OnboardCartTotal;
