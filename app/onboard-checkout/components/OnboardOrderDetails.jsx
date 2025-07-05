"use client";
import React, { useState, useEffect } from "react";

const OnboardOrderDetails = ({ selectedPackage }) => {
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (selectedPackage) {
      const price =
        selectedPackage.price === "Free"
          ? 0
          : parseFloat(selectedPackage.price);
      setOrderData({
        plan: selectedPackage.packageType,
        price: price,
        duration: "1 Month",
        features: selectedPackage.features,
        tag: selectedPackage.tag,
      });
    }
  }, [selectedPackage]);

  // Don't render anything if no package is selected
  if (!orderData) {
    return (
      <div className="order-box">
        <h3>Your Order</h3>
        <p>No package selected. Please go back to pricing page.</p>
      </div>
    );
  }

  const subtotal = orderData.price;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  // Format Euro amounts
  const formatEuroAmount = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="order-box">
      <h3>Your Order</h3>
      <table>
        <thead>
          <tr>
            <th>
              <strong>Product</strong>
            </th>
            <th>
              <strong>Subtotal</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="cart-item">
            <td className="product-name">
              {orderData.plan}
              {orderData.tag && <span className="tag">Recommended</span>}
            </td>
            <td className="product-total">
              {orderData.price === 0
                ? "Free"
                : formatEuroAmount(orderData.price)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="cart-subtotal">
            <td>Subtotal</td>
            <td>
              <span className="amount">
                {subtotal === 0 ? "Free" : formatEuroAmount(subtotal)}
              </span>
            </td>
          </tr>
          <tr className="cart-subtotal">
            <td>Tax (5%)</td>
            <td>
              <span className="amount">
                {subtotal === 0 ? "Free" : formatEuroAmount(tax)}
              </span>
            </td>
          </tr>
          <tr className="order-total">
            <td>Total</td>
            <td>
              <span className="amount">
                {total === 0 ? "Free" : formatEuroAmount(total)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Show package features if available */}
      {orderData.features && (
        <div className="package-features" style={{ marginTop: "20px" }}>
          <h4>Package Features:</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {orderData.features.map((feature, index) => (
              <li key={index} style={{ padding: "5px 0", color: "#666" }}>
                ✓ {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OnboardOrderDetails;
