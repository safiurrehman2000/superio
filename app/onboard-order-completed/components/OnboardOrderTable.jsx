"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const OnboardOrderTable = () => {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    packageName: "",
    subtotal: 0,
    tax: 0,
    total: 0,
    isFree: false,
  });

  useEffect(() => {
    const getOrderDetails = () => {
      const packageData = searchParams.get("package");

      if (packageData) {
        try {
          const packageInfo = JSON.parse(decodeURIComponent(packageData));
          const packageName = packageInfo.name || "Unknown Package";
          const price =
            packageInfo.price === "Free" ? 0 : parseFloat(packageInfo.price);
          const subtotal = price;
          const tax = subtotal * 0.05; // 5% tax
          const total = subtotal + tax;
          const isFree = packageInfo.price === "Free";

          setOrderDetails({
            packageName,
            subtotal,
            tax,
            total,
            isFree,
          });
        } catch (error) {
          console.error("Error parsing package data:", error);
        }
      }
    };

    getOrderDetails();
  }, [searchParams]);

  return (
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
          <td className="product-name">{orderDetails.packageName}</td>
          <td className="product-total">
            {orderDetails.isFree
              ? "Free"
              : `€${orderDetails.subtotal.toFixed(2)}`}
          </td>
        </tr>
      </tbody>
      <tfoot>
        {!orderDetails.isFree && (
          <>
            <tr className="cart-subtotal">
              <td>Subtotal</td>
              <td>
                <span className="amount">
                  €{orderDetails.subtotal.toFixed(2)}
                </span>
              </td>
            </tr>
            <tr className="cart-subtotal">
              <td>Tax (5%)</td>
              <td>
                <span className="amount">€{orderDetails.tax.toFixed(2)}</span>
              </td>
            </tr>
          </>
        )}
        <tr className="order-total">
          <td>Total</td>
          <td>
            <span className="amount">
              {orderDetails.isFree
                ? "Free"
                : `€${orderDetails.total.toFixed(2)}`}
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default OnboardOrderTable;
