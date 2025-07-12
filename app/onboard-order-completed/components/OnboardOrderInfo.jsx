"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/utils/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useSelector } from "react-redux";

const OnboardOrderInfo = () => {
  const searchParams = useSearchParams();
  const user = useSelector((state) => state.user.user);
  const [orderData, setOrderData] = useState({
    orderNumber: "",
    date: "",
    total: 0,
    paymentMethod: "",
    packageName: "",
    paymentStatus: "",
    receipt: null,
    loadingReceipt: true,
  });

  useEffect(() => {
    const getOrderData = async () => {
      const paymentIntent = searchParams.get("payment_intent");
      const paymentStatus = searchParams.get("payment_status");
      const packageData = searchParams.get("package");

      // Generate order number
      const orderNumber = paymentIntent
        ? `ORD-${paymentIntent.substring(0, 8).toUpperCase()}`
        : `ORD-FREE-${Date.now().toString().slice(-6)}`;

      console.log("orderNumber", orderNumber);
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

      // Fetch latest receipt for this user
      if (user?.uid) {
        try {
          const q = query(
            collection(db, "receipts"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const receipt = querySnapshot.docs[0].data();
            setOrderData((prev) => ({
              ...prev,
              receipt,
              loadingReceipt: false,
            }));
          } else {
            setOrderData((prev) => ({
              ...prev,
              receipt: null,
              loadingReceipt: false,
            }));
          }
        } catch (err) {
          setOrderData((prev) => ({
            ...prev,
            receipt: null,
            loadingReceipt: false,
          }));
        }
      } else {
        setOrderData((prev) => ({
          ...prev,
          receipt: null,
          loadingReceipt: false,
        }));
      }
    };
    getOrderData();
  }, [user?.uid]);

  return (
    <>
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
      {/* Receipt Section */}
      <div style={{ marginTop: 24 }}>
        {orderData.loadingReceipt ? (
          <div>Loading receipt...</div>
        ) : orderData.receipt ? (
          <div
            style={{ border: "1px solid #eee", padding: 16, borderRadius: 8 }}
          >
            <h4>Receipt</h4>
            <div>
              <b>Receipt ID:</b> {orderData.receipt.receiptId}
            </div>
            <div>
              <b>Package:</b> {orderData.receipt.packageName}
            </div>
            <div>
              <b>Amount:</b>{" "}
              {orderData.receipt.amount === 0
                ? "Free"
                : `${
                    orderData.receipt.amount
                  } ${orderData.receipt.currency?.toUpperCase()}`}
            </div>
            <div>
              <b>Date:</b>{" "}
              {orderData.receipt.createdAt
                ? new Date(orderData.receipt.createdAt).toLocaleString()
                : "-"}
            </div>
          </div>
        ) : (
          <div>No receipt found for your latest purchase.</div>
        )}
      </div>
    </>
  );
};

export default OnboardOrderInfo;
