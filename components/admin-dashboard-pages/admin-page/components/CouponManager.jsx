"use client";
import { errorToast, successToast } from "@/utils/toast";
import React, { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { getCouponCompatibilityForPackages } from "@/utils/couponPackageCompatibility";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPromoCodeForm, setShowPromoCodeForm] = useState({});

  // Form setup
  const methods = useForm({
    defaultValues: {
      name: "",
      discountType: "percent",
      percentOff: "",
      amountOff: "",
      currency: "eur",
      duration: "once",
      durationInMonths: "",
      maxRedemptions: "",
      redeemBy: "",
      promoCode: "",
      maxPromoRedemptions: "",
    },
  });

  const { handleSubmit, reset, watch, setValue } = methods;
  const discountType = watch("discountType");
  const duration = watch("duration");
  const amountOff = watch("amountOff");
  const percentOff = watch("percentOff");

  const draftCompatibility = useMemo(() => {
    if (!packages.length) return [];
    const hasPercent =
      discountType === "percent" &&
      percentOff &&
      !Number.isNaN(parseFloat(percentOff));
    const hasAmount =
      discountType === "amount" &&
      amountOff &&
      !Number.isNaN(parseFloat(amountOff));
    if (!hasPercent && !hasAmount) return [];

    const draftCoupon = {
      duration,
      amountOff: hasAmount ? Math.round(parseFloat(amountOff) * 100) : null,
      percentOff: hasPercent ? parseFloat(percentOff) : null,
      appliesTo: null,
    };
    return getCouponCompatibilityForPackages(draftCoupon, packages);
  }, [packages, duration, discountType, amountOff, percentOff]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/manage-coupons");
      const data = await response.json();

      if (response.ok) {
        setCoupons(data.data || []);
        setPackages(data.packages || []);
      } else {
        errorToast(data.error || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      errorToast("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const trimmedPromoCode = data.promoCode?.trim();
    if (!trimmedPromoCode) {
      errorToast(
        "Promotion code is required. Customers enter this code at Stripe checkout (not the coupon name)."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: data.name,
        duration: data.duration,
        maxRedemptions: data.maxRedemptions
          ? parseInt(data.maxRedemptions)
          : null,
        redeemBy: data.redeemBy || null,
        promoCode: trimmedPromoCode,
        maxPromoRedemptions: data.maxPromoRedemptions
          ? parseInt(data.maxPromoRedemptions)
          : null,
      };

      if (discountType === "percent") {
        payload.percentOff = parseFloat(data.percentOff);
      } else {
        payload.amountOff = parseFloat(data.amountOff);
        payload.currency = data.currency;
      }

      if (data.duration === "repeating") {
        payload.durationInMonths = parseInt(data.durationInMonths);
      }

      const response = await fetch("/api/admin/manage-coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        successToast(responseData.message || "Coupon created successfully");
        reset();
        fetchCoupons();
      } else {
        errorToast(responseData.error || "Failed to create coupon");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      errorToast("Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (
      !confirm(
        "Are you sure you want to delete this coupon? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/manage-coupons?id=${couponId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        successToast("Coupon deleted successfully");
        fetchCoupons();
      } else {
        errorToast(data.error || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      errorToast("Failed to delete coupon");
    }
  };

  const handleDeactivatePromoCode = async (promoCodeId) => {
    if (!confirm("Are you sure you want to deactivate this promotion code?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/manage-coupons?promoCodeId=${promoCodeId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        successToast("Promotion code deactivated successfully");
        fetchCoupons();
      } else {
        errorToast(data.error || "Failed to deactivate promotion code");
      }
    } catch (error) {
      console.error("Error deactivating promotion code:", error);
      errorToast("Failed to deactivate promotion code");
    }
  };

  const handleAddPromoCode = async (couponId) => {
    const promoCode = prompt("Enter the promotion code (e.g., SUMMER2024):");
    if (!promoCode) return;

    const maxRedemptions = prompt(
      "Enter max redemptions (leave empty for unlimited):"
    );

    try {
      const response = await fetch("/api/admin/manage-coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponId,
          promoCode: promoCode.trim().toUpperCase(),
          maxPromoRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        successToast("Promotion code created successfully");
        fetchCoupons();
      } else {
        errorToast(data.error || "Failed to create promotion code");
      }
    } catch (error) {
      console.error("Error creating promotion code:", error);
      errorToast("Failed to create promotion code");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatDiscount = (coupon) => {
    if (coupon.percentOff) {
      return `${coupon.percentOff}% off`;
    } else if (coupon.amountOff) {
      return `€${(coupon.amountOff / 100).toFixed(2)} off`;
    }
    return "N/A";
  };

  const formatDuration = (coupon) => {
    if (coupon.duration === "once") return "One-time";
    if (coupon.duration === "forever") return "Forever";
    if (coupon.duration === "repeating") {
      return `${coupon.durationInMonths} months`;
    }
    return coupon.duration;
  };

  if (loading) {
    return (
      <div className="ls-widget">
        <div className="widget-title">
          <h4>Manage Coupons</h4>
        </div>
        <div className="widget-content">
          <div className="loading">Loading coupons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="widget-title">
        <h4>Manage Stripe Coupons</h4>
      </div>
      <div className="widget-content">
        {/* Add Coupon Form */}
        <div className="form-group" style={{ marginBottom: "30px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            Create New Coupon
          </h5>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="row">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Coupon Name"
                  name="name"
                  placeholder="e.g., Summer Sale"
                  required={true}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <div className="form-group">
                  <label style={{ fontWeight: "600", marginBottom: "8px" }}>
                    Discount Type
                  </label>
                  <select
                    className="form-control"
                    {...methods.register("discountType")}
                    disabled={submitting}
                    style={{ height: "45px" }}
                  >
                    <option value="percent">Percentage Off</option>
                    <option value="amount">Fixed Amount Off</option>
                  </select>
                </div>
              </div>

              {discountType === "percent" ? (
                <div className="col-lg-6 col-md-6 col-sm-12">
                  <InputField
                    label="Percent Off (%)"
                    name="percentOff"
                    placeholder="20"
                    required={true}
                    fieldType="Text"
                    disabled={submitting}
                  />
                </div>
              ) : (
                <>
                  <div className="col-lg-6 col-md-6 col-sm-12">
                    <InputField
                      label="Amount Off (€)"
                      name="amountOff"
                      placeholder="10.00"
                      required={true}
                      fieldType="Text"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-12">
                    <InputField
                      label="Currency"
                      name="currency"
                      placeholder="eur"
                      required={true}
                      fieldType="Text"
                      disabled={submitting}
                    />
                  </div>
                </>
              )}

              <div className="col-lg-6 col-md-6 col-sm-12">
                <div className="form-group">
                  <label style={{ fontWeight: "600", marginBottom: "8px" }}>
                    Duration
                  </label>
                  <select
                    className="form-control"
                    {...methods.register("duration")}
                    disabled={submitting}
                    style={{ height: "45px" }}
                  >
                    <option value="once">One-time</option>
                    <option value="repeating">Repeating</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
              </div>

              {duration === "repeating" && (
                <div className="col-lg-6 col-md-6 col-sm-12">
                  <InputField
                    label="Duration (Months)"
                    name="durationInMonths"
                    placeholder="3"
                    required={true}
                    fieldType="Text"
                    disabled={submitting}
                  />
                </div>
              )}

              {duration !== "once" && packages.some((p) => p.interval === "one_time") && (
                <div className="col-lg-12">
                  <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                    <strong>One-time packages:</strong> Duration &quot;{duration}&quot; will
                    show as <strong>invalid</strong> on one-time packages at checkout. Use
                    &quot;One-time&quot; duration if you need SUMMER to work on every package.
                  </div>
                </div>
              )}

              {draftCompatibility.some((row) => !row.compatible) && (
                <div className="col-lg-12">
                  <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                    <strong>Package preview:</strong>
                    <ul style={{ marginBottom: 0, paddingLeft: "18px" }}>
                      {draftCompatibility.map((row) => (
                        <li key={row.packageId}>
                          {row.compatible ? (
                            <>
                              <span style={{ color: "#27ae60" }}>OK</span> —{" "}
                              {row.packageName} (€{row.price},{" "}
                              {row.interval === "one_time" ? "one-time" : row.interval})
                            </>
                          ) : (
                            <>
                              <span style={{ color: "#e74c3c" }}>Invalid at checkout</span>{" "}
                              — {row.packageName} (€{row.price}): {row.reasons.join(" ")}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Max Redemptions (Optional)"
                  name="maxRedemptions"
                  placeholder="Leave empty for unlimited"
                  required={false}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <div className="form-group">
                  <label style={{ fontWeight: "600", marginBottom: "8px" }}>
                    Redeem By (Optional)
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    {...methods.register("redeemBy")}
                    disabled={submitting}
                    style={{ height: "45px" }}
                  />
                </div>
              </div>

              <div className="col-lg-12 col-md-12 col-sm-12">
                <hr style={{ margin: "20px 0" }} />
                <h6 style={{ color: "#1967d2", marginBottom: "15px" }}>
                  Promotion Code (Required)
                </h6>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "15px",
                  }}
                >
                  Customers must enter this code at Stripe checkout. The coupon
                  name alone will not work and will show as invalid.
                </p>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Promotion Code"
                  name="promoCode"
                  placeholder="e.g., SUMMER2024"
                  required={true}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Max Promo Code Redemptions (Optional)"
                  name="maxPromoRedemptions"
                  placeholder="Leave empty for unlimited"
                  required={false}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>

              <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                <div className="d-flex gap-3" style={{ marginTop: "20px" }}>
                  <button
                    type="submit"
                    className="theme-btn btn-style-one"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Coupon"}
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Coupons List */}
        <div className="form-group" style={{ marginTop: "40px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            Current Coupons ({coupons.length})
          </h5>
          {coupons.length === 0 ? (
            <div className="alert alert-info">
              No coupons found. Create your first coupon using the form above.
            </div>
          ) : (
            <div className="table-responsive">
              <table
                className="table table-striped"
                style={{ marginTop: "10px" }}
              >
                <thead>
                  <tr>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Name
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Discount
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Duration
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Redemptions
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Promotion Codes
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Packages
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Status
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td>
                        <strong>{coupon.name || coupon.id}</strong>
                        <br />
                        <small style={{ color: "#666" }}>ID: {coupon.id}</small>
                        <br />
                        {coupon.redeemBy && (
                          <small style={{ color: "#e74c3c" }}>
                            Expires: {formatDate(coupon.redeemBy)}
                          </small>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: "#27ae60" }}>
                          {formatDiscount(coupon)}
                        </strong>
                      </td>
                      <td>{formatDuration(coupon)}</td>
                      <td>
                        {coupon.timesRedeemed || 0}
                        {coupon.maxRedemptions
                          ? ` / ${coupon.maxRedemptions}`
                          : " / ∞"}
                      </td>
                      <td>
                        {coupon.promotionCodes &&
                        coupon.promotionCodes.length > 0 ? (
                          <div>
                            {coupon.promotionCodes.map((promo) => (
                              <div
                                key={promo.id}
                                style={{
                                  marginBottom: "5px",
                                  padding: "5px",
                                  backgroundColor: promo.active
                                    ? "#e8f5e9"
                                    : "#ffebee",
                                  borderRadius: "4px",
                                }}
                              >
                                <strong>{promo.code}</strong>
                                <br />
                                <small>
                                  Used: {promo.timesRedeemed || 0}
                                  {promo.maxRedemptions
                                    ? ` / ${promo.maxRedemptions}`
                                    : " / ∞"}
                                </small>
                                {promo.active && (
                                  <button
                                    onClick={() =>
                                      handleDeactivatePromoCode(promo.id)
                                    }
                                    className="btn btn-sm btn-danger"
                                    style={{
                                      marginLeft: "10px",
                                      padding: "2px 8px",
                                      fontSize: "11px",
                                    }}
                                  >
                                    Deactivate
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <span style={{ color: "#e74c3c", fontWeight: 600 }}>
                              No checkout code
                            </span>
                            <br />
                            <button
                              type="button"
                              onClick={() => handleAddPromoCode(coupon.id)}
                              className="btn btn-sm btn-primary"
                              style={{ marginTop: "6px" }}
                            >
                              Add promotion code
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ maxWidth: "220px", fontSize: "13px" }}>
                        {coupon.packageCompatibility?.length ? (
                          <ul style={{ margin: 0, paddingLeft: "16px" }}>
                            {coupon.packageCompatibility.map((row) => (
                              <li key={row.packageId} style={{ marginBottom: "4px" }}>
                                {row.compatible ? (
                                  <span style={{ color: "#27ae60" }}>
                                    {row.packageName} (€{row.price})
                                  </span>
                                ) : (
                                  <span style={{ color: "#e74c3c" }} title={row.reasons.join(" ")}>
                                    {row.packageName} (€{row.price}) — invalid
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: "#999" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            coupon.valid ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {coupon.valid ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="alert alert-info" style={{ marginTop: "30px" }}>
          <h6 style={{ fontWeight: "600", marginBottom: "10px" }}>
            ℹ️ About Stripe Coupons
          </h6>
          <ul style={{ marginBottom: "0", paddingLeft: "20px" }}>
            <li>
              <strong>Coupons:</strong> Discount objects in Stripe that define
              the discount amount/percentage
            </li>
            <li>
              <strong>Promotion Codes:</strong> Customer-facing codes (like
              "SUMMER2024") that users enter at checkout
            </li>
            <li>
              <strong>Duration:</strong> &quot;One-time&quot; works on all packages.
              &quot;Forever&quot; / &quot;Repeating&quot; only work on subscription
              packages (monthly/yearly), not on one-time packages — that is why a
              code can work on a €60 plan but fail on a €28 one-time plan.
            </li>
            <li>
              <strong>Fixed € off:</strong> Must be less than the package price
              (e.g. €30 off fails on a €28 package).
            </li>
            <li>
              <strong>Very high % off (e.g. 99%):</strong> Can work on €60 but
              fail on €28.5 — after discount + 21% VAT the total must be at least
              €0.50 or Stripe marks the code invalid.
            </li>
            <li>
              Once created, the discount value cannot be changed (you can only
              update the name)
            </li>
            <li>
              To apply coupons in checkout, users enter the promotion code
              during payment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CouponManager;
