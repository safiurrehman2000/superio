"use client";
import { errorToast, successToast } from "@/utils/toast";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { TextAreaField } from "@/components/textarea/TextArea";

const PricingPackagesManager = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form setup
  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      currency: "eur",
      interval: "month",
      jobLimit: "",
      features: "",
      isActive: true,
    },
  });

  const { handleSubmit, reset, watch, setValue } = methods;

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/manage-pricing-packages");
      const data = await response.json();

      if (response.ok) {
        console.log("Fetched packages:", data.data); // Debug log
        setPackages(data.data || []);
      } else {
        errorToast(data.error || "Failed to fetch packages");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      errorToast("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      // Parse features from text to array
      const features = data.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0);

      const payload = {
        ...data,
        price: parseFloat(data.price),
        jobLimit: parseInt(data.jobLimit),
        features,
        isActive: data.isActive === "true" || data.isActive === true,
      };

      const url = editingPackage
        ? "/api/admin/manage-pricing-packages"
        : "/api/admin/manage-pricing-packages";

      const method = editingPackage ? "PUT" : "POST";

      if (editingPackage) {
        payload.id = editingPackage.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        successToast(responseData.message || "Package saved successfully");
        reset();
        setEditingPackage(null);
        fetchPackages();
      } else {
        errorToast(responseData.error || "Failed to save package");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      errorToast("Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setValue("name", pkg.packageType || pkg.name || "");
    setValue("description", pkg.description || "");
    setValue("price", pkg.price.toString());
    setValue("currency", pkg.currency || "eur");
    setValue("interval", pkg.interval || "month");
    setValue("jobLimit", (pkg.jobPosts || pkg.jobLimit || 0).toString());
    setValue(
      "features",
      Array.isArray(pkg.features) ? pkg.features.join("\n") : ""
    );
    setValue("isActive", pkg.isActive.toString());
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this package? This will also archive the Stripe product."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/manage-pricing-packages?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        successToast("Package deleted successfully");
        fetchPackages();
      } else {
        errorToast(data.error || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      errorToast("Failed to delete package");
    }
  };

  const handleCancel = () => {
    setEditingPackage(null);
    reset();
  };

  if (loading) {
    return (
      <div className="ls-widget">
        <div className="widget-title">
          <h4>Manage Pricing Packages</h4>
        </div>
        <div className="widget-content">
          <div className="loading">Loading packages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="widget-title">
        <h4>Manage Pricing Packages</h4>
      </div>
      <div className="widget-content">
        {/* Add/Edit Package Form */}
        <div className="form-group" style={{ marginBottom: "30px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            {editingPackage ? "Edit Package" : "Add New Package"}
          </h5>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="row">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Package Name"
                  name="name"
                  placeholder="e.g., Basic Plan"
                  required={true}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Price (€)"
                  name="price"
                  placeholder="29.99"
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
              <div className="col-lg-6 col-md-6 col-sm-12">
                <select
                  className="form-control"
                  {...methods.register("interval")}
                  disabled={submitting}
                  style={{ height: "45px" }}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="week">Weekly</option>
                </select>
                <label style={{ fontWeight: "600", marginBottom: "8px" }}>
                  Billing Interval
                </label>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Job Limit"
                  name="jobLimit"
                  placeholder="10"
                  required={true}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                <select
                  className="form-control"
                  {...methods.register("isActive")}
                  disabled={submitting}
                  style={{ height: "45px" }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <label style={{ fontWeight: "600", marginBottom: "8px" }}>
                  Status
                </label>
              </div>
              <div className="col-lg-12 col-md-12 col-sm-12">
                <TextAreaField
                  label="Description"
                  name="description"
                  placeholder="Describe what this package includes..."
                  required={false}
                />
              </div>
              <div className="col-lg-12 col-md-12 col-sm-12">
                <TextAreaField
                  label="Features (one per line)"
                  name="features"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  required={false}
                />
              </div>
              <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                <div className="d-flex gap-3" style={{ marginTop: "20px" }}>
                  <button
                    type="submit"
                    className="theme-btn btn-style-one"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : editingPackage
                      ? "Update Package"
                      : "Create Package"}
                  </button>
                  {editingPackage && (
                    <button
                      type="button"
                      className="theme-btn btn-style-two"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Packages List */}
        <div className="form-group" style={{ marginTop: "40px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            Current Packages ({packages.length})
          </h5>
          {packages.length === 0 ? (
            <div className="alert alert-info">
              No packages found. Create your first package using the form above.
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
                      Price
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Interval
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Job Limit
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
                  {packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <strong>
                          {pkg.packageType || pkg.name || "Unnamed Package"}
                        </strong>
                        {pkg.tag && (
                          <span className="badge bg-warning ms-2">
                            {pkg.tag}
                          </span>
                        )}
                        <br />
                        <small style={{ color: "#666" }}>
                          {pkg.description ||
                            (pkg.features && pkg.features.length > 0
                              ? pkg.features.slice(0, 2).join(", ") +
                                (pkg.features.length > 2 ? "..." : "")
                              : "No description")}
                        </small>
                      </td>
                      <td>
                        {pkg.price === "Free" ? "Free" : `€${pkg.price}`}{" "}
                        {pkg.interval &&
                          pkg.interval !== "month" &&
                          `/ ${pkg.interval}`}
                      </td>
                      <td>{pkg.interval || "One-time"}</td>
                      <td>{pkg.jobPosts || pkg.jobLimit || 0} jobs</td>
                      <td>
                        <span
                          className={`badge ${
                            pkg.isActive ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="btn btn-sm btn-primary"
                            disabled={submitting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="btn btn-sm btn-danger"
                            disabled={submitting}
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
      </div>
    </div>
  );
};

export default PricingPackagesManager;
