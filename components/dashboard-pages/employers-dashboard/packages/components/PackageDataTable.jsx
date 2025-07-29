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
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { errorToast, successToast } from "@/utils/toast";

const PackageDataTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState({});
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(null);
  const [hasArchivedJobs, setHasArchivedJobs] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);
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

  useEffect(() => {
    if (!user?.uid) return;
    const fetchUserPlanAndSubscription = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setPlanId(userDoc.data().planId || null);
        setStripeSubscriptionId(userDoc.data().stripeSubscriptionId || null);
      }
    };
    fetchUserPlanAndSubscription();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const checkArchivedJobs = async () => {
      const jobsQuery = query(
        collection(db, "jobs"),
        where("employerId", "==", user.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map((doc) => doc.data());
      const hasArchived = jobs.some((job) => job.status === "archived");
      setHasArchivedJobs(hasArchived);
    };
    checkArchivedJobs();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    // Fetch subscription status from backend
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await fetch("/api/subscription-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        });
        const data = await res.json();
        console.log("Subscription status API response:", data); // Debug log
        if (data.active && data.current_period_end) {
          setCurrentPeriodEnd(data.current_period_end);
        } else {
          setCurrentPeriodEnd(null);
        }
      } catch (err) {
        setCurrentPeriodEnd(null);
      }
    };
    fetchSubscriptionStatus();
  }, [user?.uid]);

  const currentPlanName = planId ? packages[planId] || planId : "None";
  const hasActiveSubscription = Boolean(stripeSubscriptionId);

  // Calculate days left
  const daysLeft = currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (currentPeriodEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

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
        successToast("Subscription cancelled!");
        setPlanId(null);
        setStripeSubscriptionId(null);
        // Fetch jobs and check for archived jobs
        if (user?.uid) {
          const jobsQuery = query(
            collection(db, "jobs"),
            where("employerId", "==", user.uid)
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobs = jobsSnapshot.docs.map((doc) => doc.data());

          const hasArchived = jobs.some((job) => job.status === "archived");
          setHasArchivedJobs(hasArchived);
        }
      } else {
        errorToast(data.error || "Failed to cancel subscription.");
      }
    } catch (err) {
      errorToast("Error cancelling subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
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
            <p style={{ color: "#d32f2f", fontWeight: 500, marginTop: 12 }}>
              Cancelling your subscription will archive your jobs and users
              won't be able to see them.
            </p>
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
                className="theme-btn btn-style-one"
              >
                {cancelLoading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
                    <CircularLoader size={18} strokeColor="#fa5508" />
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={cancelLoading}
                className="theme-btn btn-style-three"
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
          {!cancelSuccess && (
            <span style={{ color: "#fa5508" }}>
              {currentPlanName}
              {daysLeft !== null && daysLeft > 0 && (
                <span style={{ marginLeft: 12, color: "#1976d2" }}>
                  ({daysLeft} day{daysLeft > 1 ? "s" : ""} left)
                </span>
              )}
            </span>
          )}
          {cancelSuccess && (
            <span style={{ color: "green", marginLeft: 16 }}>
              Subscription cancelled!
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.push("/pricing")}
            className="theme-btn btn-style-two"
          >
            {currentPlanName === "None"
              ? "Buy Subscription"
              : "Change Subscription"}
          </button>
          {hasActiveSubscription && currentPlanName !== "None" && (
            <button
              onClick={() => setShowModal(true)}
              disabled={cancelLoading}
              className="theme-btn btn-style-three"
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
                <td>{r.id}</td>
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
