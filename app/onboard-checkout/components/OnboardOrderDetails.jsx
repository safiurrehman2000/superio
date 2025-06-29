"use client";
import React from "react";

const OnboardOrderDetails = () => {
  // Dummy order data
  const orderData = {
    plan: "Basic Plan",
    price: 99,
    duration: "1 Month",
  };

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
            <td className="product-name">{orderData.plan}</td>
            <td className="product-total">
              {formatEuroAmount(orderData.price)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="cart-subtotal">
            <td>Subtotal</td>
            <td>
              <span className="amount">{formatEuroAmount(subtotal)}</span>
            </td>
          </tr>
          <tr className="cart-subtotal">
            <td>Tax (5%)</td>
            <td>
              <span className="amount">{formatEuroAmount(tax)}</span>
            </td>
          </tr>
          <tr className="order-total">
            <td>Total</td>
            <td>
              <span className="amount">{formatEuroAmount(total)}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OnboardOrderDetails;
