"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { useSelector } from "react-redux";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const PackageDataTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState({});
  const user = useSelector((state) => state.user.user);

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

  return (
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
                  : `${r.amount} ${r.currency?.toUpperCase()}`}
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
  );
};

export default PackageDataTable;
