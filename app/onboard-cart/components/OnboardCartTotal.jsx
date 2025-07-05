"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OnboardCartTotal = ({ selectedPackage }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (selectedPackage) {
      // Convert the selected package to cart item format
      const cartItem = {
        id: selectedPackage.id,
        title: selectedPackage.packageType,
        price:
          selectedPackage.price === "Free"
            ? 0
            : parseFloat(selectedPackage.price),
        qty: 1,
      };
      setCartItems([cartItem]);
    } else {
      // Fallback to dummy data if no package selected
      setCartItems([
        {
          id: 1,
          title: "Basic Plan",
          price: 99,
          qty: 1,
        },
      ]);
    }
  }, [selectedPackage]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  // Format Euro amounts
  const formatEuroAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleCheckout = () => {
    // Add payment processing logic here
    console.log("Processing payment...");

    // Pass the selected package data to checkout page
    if (selectedPackage) {
      const packageParam = encodeURIComponent(JSON.stringify(selectedPackage));
      router.push(`/onboard-checkout?package=${packageParam}`);
    } else {
      // Fallback to checkout without package data
      router.push("/onboard-checkout");
    }
  };

  return (
    <div className="totals-table-outer">
      <ul className="totals-table">
        <li>
          <h3>Cart Totals</h3>
        </li>

        <li>
          <span className="col">Subtotal</span>
          <span className="col price">
            {subtotal === 0 ? "Free" : formatEuroAmount(subtotal)}
          </span>
        </li>
        <li>
          <span className="col">Tax (5%)</span>
          <span className="col price">
            {subtotal === 0 ? "Free" : formatEuroAmount(tax)}
          </span>
        </li>

        <li>
          <span className="col">Total</span>
          <span className="col price">
            {total === 0 ? "Free" : formatEuroAmount(total)}
          </span>
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
