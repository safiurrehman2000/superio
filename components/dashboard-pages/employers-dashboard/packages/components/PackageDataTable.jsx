"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { useSelector } from "react-redux";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const PackageDataTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState({});
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [planId, setPlanId] = useState(null);
  const user = useSelector((state) => state.user.user);
  const router = useRouter();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(collection(db, "pricingPackages"));
        const querySnapshot = await getDocs(q);
        const pkgMap = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.id && data.packageType) {
            pkgMap[data.id] = data.packageType;
          }
        });
        setPackages(pkgMap);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setPackages({});
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const fetchReceipts = async () => {
      try {
        const q = query(
          collection(db, "receipts"),
          where("userId", "==", user.uid),
          orderBy("created", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReceipts(data);
      } catch (err) {
        console.error(err);
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [user?.uid]);

  // Fetch planId directly from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const fetchUserPlan = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log("userDoc", userDoc);
      if (userDoc.exists()) {
        setPlanId(userDoc.data().planId || null);
      }
    };
    fetchUserPlan();
  }, [user?.uid]);

  const currentPlanName = planId ? packages[planId] || planId : "None";
  const hasActiveSubscription = Boolean(user?.stripeSubscriptionId);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelSuccess(false);
    try {
      const res = await fetch("/api/change-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, cancel: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setShowModal(false);
        // Optionally, refresh user data here
      } else {
        alert(data.error || "Failed to cancel subscription.");
      }
    } catch (err) {
      alert("Error cancelling subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      {/* Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 8,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              minWidth: 320,
              textAlign: "center",
            }}
          >
            <h3>Cancel Subscription</h3>
            <p>Are you sure you want to cancel your subscription?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 24,
              }}
            >
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                style={{
                  background: cancelLoading ? "#ccc" : "#d32f2f",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: cancelLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={cancelLoading}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: cancelLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          background: "#f7f7f7",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>Current Subscription:</strong>{" "}
          <span style={{ color: "#fa5508" }}>{currentPlanName}</span>
          {cancelSuccess && (
            <span style={{ color: "green", marginLeft: 16 }}>
              Subscription cancelled!
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.push("/pricing")}
            style={{
              background: "#fa5508",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Change Subscription
          </button>
          {hasActiveSubscription && (
            <button
              onClick={() => setShowModal(true)}
              disabled={cancelLoading}
              style={{
                background: cancelLoading ? "#ccc" : "#d32f2f",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: cancelLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
      <table className="default-table manage-job-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Receipt ID</th>
            <th>Package</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Receipt PDF</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Loading receipts...
              </td>
            </tr>
          ) : receipts.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No receipts found.
              </td>
            </tr>
          ) : (
            receipts.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.id}</td> {/* Firestore doc ID */}
                <td>{packages[r.planId] || r.planId || "N/A"}</td>{" "}
                {/* Package name or planId */}
                <td>
                  {r.amount === 0
                    ? "Free"
                    : `${r.amount / 100} ${r.currency?.toUpperCase()}`}
                </td>
                <td>
                  {r.created
                    ? (r.created.seconds
                        ? new Date(r.created.seconds * 1000)
                        : new Date(r.created)
                      ).toLocaleString()
                    : ""}
                </td>
                <td>
                  {r.receipt_pdf_url ? (
                    <a
                      href={r.receipt_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fa5508", textDecoration: "underline" }}
                    >
                      Download PDF
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};

export default PackageDataTable;
