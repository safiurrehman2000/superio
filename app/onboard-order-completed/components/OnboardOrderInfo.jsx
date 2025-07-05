"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const OnboardOrderInfo = () => {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState({
    orderNumber: "",
    date: "",
    total: 0,
    paymentMethod: "",
    packageName: "",
    paymentStatus: "",
  });

  useEffect(() => {
    const getOrderData = () => {
      const paymentIntent = searchParams.get("payment_intent");
      const paymentStatus = searchParams.get("payment_status");
      const packageData = searchParams.get("package");

      // Generate order number
      const orderNumber = paymentIntent
        ? `ORD-${paymentIntent.substring(0, 8).toUpperCase()}`
        : `ORD-FREE-${Date.now().toString().slice(-6)}`;

      // Get current date
      const currentDate = new Date().toLocaleDateString("en-GB");

      // Get payment method
      const paymentMethod =
        paymentStatus === "free_completed" ? "Free Package" : "Credit Card";

      // Get package data
      let packageName = "Unknown Package";
      let total = 0;

      if (packageData) {
        try {
          const packageInfo = JSON.parse(decodeURIComponent(packageData));
          packageName = packageInfo.name || "Unknown Package";
          total =
            packageInfo.price === "Free" ? 0 : parseFloat(packageInfo.price);
          // Add 5% tax for paid packages
          if (total > 0) {
            total = total + total * 0.05;
          }
        } catch (error) {
          console.error("Error parsing package data:", error);
        }
      }

      setOrderData({
        orderNumber,
        date: currentDate,
        total,
        paymentMethod,
        packageName,
        paymentStatus: paymentStatus || "completed",
      });
    };

    getOrderData();
  }, [searchParams]);

  return (
    <ul className="order-info">
      <li>
        <span>Order Number</span>
        <strong>{orderData.orderNumber}</strong>
      </li>

      <li>
        <span>Date</span>
        <strong>{orderData.date}</strong>
      </li>

      <li>
        <span>Total</span>
        <strong>
          {orderData.total === 0 ? "Free" : `€${orderData.total.toFixed(2)}`}
        </strong>
      </li>

      <li>
        <span>Payment Method</span>
        <strong>{orderData.paymentMethod}</strong>
      </li>
    </ul>
  );
};

export default OnboardOrderInfo;
