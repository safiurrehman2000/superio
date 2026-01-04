import React, { useEffect, useState, useRef } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { successToast, errorToast } from "@/utils/toast";
import styles from "./admin-tables.module.scss";

const PAGE_SIZE = 10;

export default function ActiveSubscriptionsTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [planMap, setPlanMap] = useState({});
  const [planTypes, setPlanTypes] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("email");
  const [sortDir, setSortDir] = useState("asc");
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToCancel, setUserToCancel] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [changingUserId, setChangingUserId] = useState(null);
  const [cancellingUserId, setCancellingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  useEffect(() => {
    fetchPlanMap();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Object.keys(planMap).length > 0) {
      setPageStack([]);
      setCurrentPage(1);
      fetchActiveUsers();
    }
    // eslint-disable-next-line
  }, [planMap, search, selectedPlans, sortBy, sortDir]);

  const fetchPlanMap = async () => {
    // Fetch all pricing packages from Firestore
    const packagesQuery = query(collection(db, "pricingPackages"));
    const snap = await getDocs(packagesQuery);
    const map = {};
    const types = [];
    const plans = [];
    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.stripePriceId && data.packageType) {
        map[data.stripePriceId] = data.packageType;
        if (!types.includes(data.packageType)) types.push(data.packageType);
        plans.push({
          id: doc.id,
          priceId: data.stripePriceId,
          name: data.packageType,
          price: data.price,
          interval: data.interval,
        });
      }
    });
    setPlanMap(map);
    setPlanTypes(types);
    setAvailablePlans(plans);
  };

  const fetchActiveUsers = async (direction = null, startDoc = null) => {
    setLoading(true);
    try {
      let q = collection(db, "users");
      let constraints = [where("userType", "==", "Employer"), orderBy("email")];

      // Fetch all records when searching or filtering by plan type
      const hasFilters = search || selectedPlans.length > 0;
      if (hasFilters) {
        constraints.push(limit(1000));
      } else {
        constraints.push(limit(PAGE_SIZE + 1));
        if (startDoc) {
          constraints.push(startAfter(startDoc));
        }
      }

      const usersQuery = query(q, ...constraints);
      const snapshot = await getDocs(usersQuery);
      let docs = snapshot.docs;

      if (!hasFilters) {
        setHasNext(docs.length > PAGE_SIZE);
        if (docs.length > PAGE_SIZE) {
          docs = docs.slice(0, PAGE_SIZE);
        }
      } else {
        setHasNext(false);
      }

      let usersList = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // For each user, fetch subscription status
      const usersWithSubs = await Promise.all(
        usersList.map(async (user) => {
          let planName = "-";
          let daysLeft = "-";
          let planId = null;
          let hasActiveSubscription = false;

          // Check if user has a stripe subscription ID
          if (user.stripeSubscriptionId) {
            try {
              const res = await fetch("/api/subscription-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
              });
              const data = await res.json();
              if (data.active && data.current_period_end) {
                planId = data.planName || "-";
                planName = planMap[planId] || planId || "-";
                const days = Math.max(
                  0,
                  Math.ceil(
                    (data.current_period_end * 1000 - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
                daysLeft = days > 0 ? days : 0;
                hasActiveSubscription = true;
              }
            } catch (err) {
              // ignore
            }
          }

          return { ...user, planName, daysLeft, planId, hasActiveSubscription };
        })
      );

      // Filter by plan type
      let filtered = usersWithSubs;
      if (selectedPlans.length > 0) {
        filtered = filtered.filter((u) => selectedPlans.includes(u.planName));
      }

      // Search filter
      if (search) {
        filtered = filtered.filter(
          (u) =>
            (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
            (u.planName &&
              u.planName.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // Sort
      filtered = filtered.sort((a, b) => {
        let valA = a[sortBy] || "";
        let valB = b[sortBy] || "";
        if (sortBy === "daysLeft") {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });

      setUsers(filtered);
      if (!hasFilters) {
        setFirstDoc(docs[0]);
        setLastDoc(docs[docs.length - 1]);
      }

      // Update pagination info only when navigating
      if (direction === "next") {
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
      // If direction is null (initial load), don't change the page number
    } catch (error) {
      console.error("Error fetching users:", error);
      errorToast("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setPageStack((prev) => [...prev, firstDoc]);
    fetchActiveUsers("next", lastDoc);
  };

  const handlePrev = () => {
    const prevStack = [...pageStack];
    const prevDoc = prevStack.pop();
    setPageStack(prevStack);
    fetchActiveUsers("prev", prevDoc);
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handlePlanTypeChange = (plan) => {
    setSelectedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  const handleChangeSubscription = (user) => {
    setSelectedUser(user);
    setShowChangeModal(true);
  };

  const handleCancelClick = (user) => {
    setUserToCancel(user);
    setShowCancelModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!userToCancel) return;

    setCancellingUserId(userToCancel.id);
    try {
      const res = await fetch("/api/change-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userToCancel.id,
          action: "cancel",
        }),
      });

      if (res.ok) {
        successToast("Subscription cancelled successfully");
        setShowCancelModal(false);
        setUserToCancel(null);
        fetchActiveUsers(); // Refresh the list
      } else {
        const error = await res.json();
        errorToast(error.message || "Failed to cancel subscription");
      }
    } catch (error) {
      errorToast("Error cancelling subscription");
    } finally {
      setCancellingUserId(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setUserToCancel(null);
  };

  const handlePlanChange = async (newPlanId) => {
    if (!selectedUser) return;

    setChangingUserId(selectedUser.id);
    try {
      const res = await fetch("/api/change-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "change",
          newPlanId,
        }),
      });

      if (res.ok) {
        successToast("Subscription changed successfully");
        setShowChangeModal(false);
        fetchActiveUsers(); // Refresh the list
      } else {
        const error = await res.json();
        errorToast(error.message || "Failed to change subscription");
      }
    } catch (error) {
      errorToast("Error changing subscription");
    } finally {
      setChangingUserId(null);
    }
  };

  const handleSetSubscription = async (newPlanId) => {
    if (!selectedUser) return;

    setChangingUserId(selectedUser.id);
    try {
      const res = await fetch("/api/change-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "set",
          newPlanId,
        }),
      });

      if (res.ok) {
        successToast("Subscription set successfully");
        setShowChangeModal(false);
        fetchActiveUsers(); // Refresh the list
      } else {
        const error = await res.json();
        errorToast(error.message || "Failed to set subscription");
      }
    } catch (error) {
      errorToast("Error setting subscription");
    } finally {
      setChangingUserId(null);
    }
  };

  return (
    <div className={styles["admin-table-container"]}>
      <h2 className={styles["admin-table-title"]}>User Subscriptions</h2>
      <div
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          type="text"
          placeholder="Search by email, name, or plan..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles["admin-table-input"]}
        />
        {planTypes.map((plan) => (
          <label
            key={plan}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <input
              type="checkbox"
              checked={selectedPlans.includes(plan)}
              onChange={() => handlePlanTypeChange(plan)}
              className={styles["admin-table-checkbox"]}
            />
            {plan}
          </label>
        ))}
      </div>
      <table className={styles["admin-table"]}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("email")}
              style={{ cursor: "pointer" }}
            >
              Email {sortBy === "email" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Name {sortBy === "name" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("userType")}
              style={{ cursor: "pointer" }}
            >
              User Type{" "}
              {sortBy === "userType" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("planName")}
              style={{ cursor: "pointer" }}
            >
              Plan Name{" "}
              {sortBy === "planName" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th
              onClick={() => handleSort("daysLeft")}
              style={{ cursor: "pointer" }}
            >
              Days Left{" "}
              {sortBy === "daysLeft" && (sortDir === "asc" ? "▲" : "▼")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className={styles["admin-table-loading"]}>
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles["admin-table-empty"]}>
                No active subscriptions found.
              </td>
            </tr>
          ) : (
            users?.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name || "-"}</td>
                <td>
                  {user.userType === "Candidate" && (
                    <span
                      className={`${styles.chip} ${styles["chip-candidate"]}`}
                    >
                      Candidate
                    </span>
                  )}
                  {user.userType === "Employer" && (
                    <span
                      className={`${styles.chip} ${styles["chip-employer"]}`}
                    >
                      Employer
                    </span>
                  )}
                  {user.userType === "Admin" && (
                    <span className={`${styles.chip} ${styles["chip-admin"]}`}>
                      Admin
                    </span>
                  )}
                </td>
                <td>
                  {user.hasActiveSubscription ? (
                    user.planName
                  ) : (
                    <span
                      className={`${styles.chip} ${styles["chip-no-subscription"]}`}
                    >
                      No Subscription
                    </span>
                  )}
                </td>
                <td>
                  {user.hasActiveSubscription ? (
                    user.daysLeft
                  ) : (
                    <span style={{ color: "#999" }}>-</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {user.hasActiveSubscription ? (
                      <>
                        <button
                          onClick={() => handleChangeSubscription(user)}
                          className={styles["admin-table-btn"]}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          disabled={
                            changingUserId === user.id ||
                            cancellingUserId === user.id
                          }
                        >
                          {changingUserId === user.id
                            ? "Changing..."
                            : "Change"}
                        </button>
                        <button
                          onClick={() => handleCancelClick(user)}
                          className={styles["admin-table-btn"]}
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            backgroundColor: "#dc3545",
                            color: "white",
                          }}
                          disabled={
                            changingUserId === user.id ||
                            cancellingUserId === user.id
                          }
                        >
                          {cancellingUserId === user.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleChangeSubscription(user)}
                        className={styles["admin-table-btn"]}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          backgroundColor: "#28a745",
                          color: "white",
                        }}
                        disabled={changingUserId === user.id}
                      >
                        {changingUserId === user.id
                          ? "Setting..."
                          : "Set Subscription"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {!search && selectedPlans.length === 0 && (
        <div className={styles["admin-table-actions"]}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handlePrev}
              disabled={pageStack.length === 0 || loading}
              className={styles["admin-table-btn"]}
            >
              Previous
            </button>

            <span style={{ fontSize: "14px", color: "#666" }}>
              Page {currentPage}
              {users.length > 0 && (
                <span style={{ marginLeft: "8px" }}>
                  (Showing {users.length} results)
                </span>
              )}
            </span>

            <button
              onClick={handleNext}
              disabled={!hasNext || loading}
              className={styles["admin-table-btn"]}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {(search || selectedPlans.length > 0) && users.length > 0 && (
        <div className={styles["admin-table-actions"]}>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Showing {users.length} result{users.length !== 1 ? "s" : ""}
            {search && ` for "${search}"`}
            {selectedPlans.length > 0 && (
              <span>
                {" "}
                with plan{selectedPlans.length > 1 ? "s" : ""}:{" "}
                {selectedPlans.join(", ")}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Change Subscription Modal */}
      {showChangeModal && selectedUser && (
        <div className={styles["admin-modal-overlay"]}>
          <div className={styles["admin-modal"]}>
            <h3>
              {selectedUser.hasActiveSubscription
                ? `Change Subscription for ${selectedUser.email}`
                : `Set Subscription for ${selectedUser.email}`}
            </h3>
            <p>
              {selectedUser.hasActiveSubscription
                ? `Current Plan: ${selectedUser.planName}`
                : "No active subscription"}
            </p>

            <div style={{ marginTop: 16 }}>
              <h4>Available Plans:</h4>
              {availablePlans
                .filter((plan) =>
                  selectedUser.hasActiveSubscription
                    ? plan.name !== selectedUser.planName
                    : true
                )
                .map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      padding: 12,
                      border: "1px solid #ddd",
                      margin: "8px 0",
                      borderRadius: 4,
                      cursor:
                        changingUserId === selectedUser?.id
                          ? "not-allowed"
                          : "pointer",
                      opacity: changingUserId === selectedUser?.id ? 0.6 : 1,
                    }}
                    onClick={() => {
                      if (!changingUserId) {
                        if (selectedUser.hasActiveSubscription) {
                          handlePlanChange(plan.priceId);
                        } else {
                          handleSetSubscription(plan.priceId);
                        }
                      }
                    }}
                  >
                    <strong>{plan.name}</strong>
                    <br />${plan.price}/{plan.interval}
                    {changingUserId === selectedUser?.id && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        {selectedUser.hasActiveSubscription
                          ? "Changing subscription..."
                          : "Setting subscription..."}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowChangeModal(false)}
                className={styles["admin-table-btn"]}
                disabled={changingUserId === selectedUser?.id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && userToCancel && (
        <div className={styles["admin-modal-overlay"]}>
          <div className={styles["admin-modal"]}>
            <h3>Cancel Subscription</h3>
            <p>
              Are you sure you want to cancel the subscription for{" "}
              <strong>{userToCancel.email}</strong>?
            </p>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Current Plan: {userToCancel.planName}
            </p>
            <p
              style={{ color: "#dc3545", fontSize: "14px", fontWeight: "bold" }}
            >
              This action cannot be undone. The user will lose access to premium
              features immediately.
            </p>

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                onClick={handleCancelModalClose}
                className={styles["admin-table-btn"]}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                }}
                disabled={cancellingUserId === userToCancel?.id}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className={styles["admin-table-btn"]}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                }}
                disabled={cancellingUserId === userToCancel?.id}
              >
                {cancellingUserId === userToCancel?.id
                  ? "Cancelling..."
                  : "Yes, Cancel Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
