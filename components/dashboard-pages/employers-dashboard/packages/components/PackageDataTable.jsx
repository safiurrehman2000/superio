"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { useSelector } from "react-redux";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const PackageDataTable = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const fetchReceipts = async () => {
      try {
        const q = query(
          collection(db, "receipts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceipts(data);
      } catch (err) {
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
          <th>Status</th>
          <th>Date</th>
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
              <td>{r.receiptId}</td>
              <td>{r.packageName}</td>
              <td>
                {r.amount === 0
                  ? "Free"
                  : `${r.amount} ${r.currency?.toUpperCase()}`}
              </td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PackageDataTable;
