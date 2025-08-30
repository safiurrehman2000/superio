"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { errorToast, successToast } from "@/utils/toast";
import { SECTORS, STATES } from "@/utils/constants";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";

const JobAlertsManager = () => {
  const selector = useSelector((state) => state.user);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      frequency: "daily",
      categories: [],
      locations: [],
      keywords: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isValid },
  } = methods;

  useEffect(() => {
    if (selector?.user?.uid) {
      loadJobAlerts();
    }
  }, [selector?.user?.uid]);

  const loadJobAlerts = async () => {
    try {
      setLoading(true);
      const alertsRef = collection(db, `users/${selector.user.uid}/jobAlerts`);
      const alertsSnapshot = await getDocs(alertsRef);

      const alertsData = alertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading job alerts:", error);
      errorToast("Failed to load job alerts");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selector?.user?.uid) {
      errorToast("Please log in to create job alerts");
      return;
    }

    setSaving(true);
    try {
      const alertData = {
        frequency: data.frequency,
        categories: data.categories.map((cat) => cat.value),
        locations: data.locations.map((loc) => loc.value),
        keywords: data.keywords.trim(),
        status: "active",
        createdAt: editingAlert ? editingAlert.createdAt : Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (editingAlert) {
        // Update existing alert
        await updateDoc(
          doc(db, `users/${selector.user.uid}/jobAlerts`, editingAlert.id),
          alertData
        );
        successToast("Job alert updated successfully!");
      } else {
        // Create new alert
        await addDoc(
          collection(db, `users/${selector.user.uid}/jobAlerts`),
          alertData
        );
        successToast("Job alert created successfully!");
      }

      reset();
      setEditingAlert(null);
      loadJobAlerts();
    } catch (error) {
      console.error("Error saving job alert:", error);
      errorToast("Failed to save job alert");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setValue("frequency", alert.frequency);
    setValue(
      "categories",
      alert.categories.map((cat) => ({ value: cat, label: cat }))
    );
    setValue(
      "locations",
      alert.locations.map((loc) => ({ value: loc, label: loc }))
    );
    setValue("keywords", alert.keywords || "");
  };

  const handleDelete = async (alertId) => {
    if (!confirm("Are you sure you want to delete this job alert?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, `users/${selector.user.uid}/jobAlerts`, alertId));
      successToast("Job alert deleted successfully!");
      loadJobAlerts();
    } catch (error) {
      console.error("Error deleting job alert:", error);
      errorToast("Failed to delete job alert");
    }
  };

  const handleToggleStatus = async (alert) => {
    try {
      const newStatus = alert.status === "active" ? "inactive" : "active";
      await updateDoc(
        doc(db, `users/${selector.user.uid}/jobAlerts`, alert.id),
        { status: newStatus, updatedAt: Timestamp.now() }
      );
      successToast(
        `Job alert ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
      loadJobAlerts();
    } catch (error) {
      console.error("Error toggling alert status:", error);
      errorToast("Failed to update alert status");
    }
  };

  const handleCancel = () => {
    setEditingAlert(null);
    reset();
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const categoryOptions = SECTORS.map((sector) => ({
    value: sector.value,
    label: sector.label,
  }));

  const locationOptions = STATES.map((state) => ({
    value: state?.value,
    label: state?.label,
  }));

  if (loading) {
    return (
      <div className="ls-widget">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Job Alerts</h4>
          </div>
          <div className="widget-content">
            <div className="text-center py-4">
              <CircularLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>{editingAlert ? "Edit Job Alert" : "Create Job Alert"}</h4>
        </div>
        <div className="widget-content">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="default-form">
              <div className="row">
                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <SelectField
                    name="frequency"
                    label="Alert Frequency"
                    options={frequencyOptions}
                    placeholder="Select frequency"
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <InputField
                    name="keywords"
                    label="Keywords (optional)"
                    placeholder="e.g., React, JavaScript, Remote"
                    fieldType="Text"
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <AutoSelect
                    name="categories"
                    label="Job Categories"
                    options={categoryOptions}
                    placeholder="Select categories"
                    isMulti
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <AutoSelect
                    name="locations"
                    label="Preferred Locations"
                    options={locationOptions}
                    placeholder="Select locations"
                    isMulti
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="theme-btn btn-style-one"
                      disabled={saving || !isValid}
                    >
                      {saving ? (
                        <>
                          <CircularLoader size={16} />
                          {editingAlert ? "Updating..." : "Creating..."}
                        </>
                      ) : editingAlert ? (
                        "Update Alert"
                      ) : (
                        "Create Alert"
                      )}
                    </button>
                    {editingAlert && (
                      <button
                        type="button"
                        className="theme-btn btn-style-two"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Existing Alerts */}
      <div className="ls-widget mt-4">
        <div className="tabs-box">
          <div className="widget-title">
            <h4>Your Job Alerts</h4>
          </div>
          <div className="widget-content">
            {alerts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No job alerts created yet.</p>
                <p className="text-muted">
                  Create your first job alert above to get started!
                </p>
              </div>
            ) : (
              <div className="table-outer">
                <table className="default-table manage-job-table">
                  <thead>
                    <tr>
                      <th>Frequency</th>
                      <th>Categories</th>
                      <th>Locations</th>
                      <th>Keywords</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <span className="badge bg-primary">
                            {alert.frequency.charAt(0).toUpperCase() +
                              alert.frequency.slice(1)}
                          </span>
                        </td>
                        <td>
                          {alert.categories.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {alert.categories
                                .slice(0, 2)
                                .map((cat, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-light text-dark"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              {alert.categories.length > 2 && (
                                <span className="badge bg-light text-dark">
                                  +{alert.categories.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">All categories</span>
                          )}
                        </td>
                        <td>
                          {alert.locations.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {alert.locations.slice(0, 2).map((loc, index) => (
                                <span
                                  key={index}
                                  className="badge bg-light text-dark"
                                >
                                  {loc}
                                </span>
                              ))}
                              {alert.locations.length > 2 && (
                                <span className="badge bg-light text-dark">
                                  +{alert.locations.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">All locations</span>
                          )}
                        </td>
                        <td>
                          {alert.keywords ? (
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "150px" }}
                            >
                              {alert.keywords}
                            </span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              alert.status === "active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {alert.status.charAt(0).toUpperCase() +
                              alert.status.slice(1)}
                          </span>
                        </td>
                        <td>{alert.createdAt.toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(alert)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${
                                alert.status === "active"
                                  ? "btn-outline-warning"
                                  : "btn-outline-success"
                              }`}
                              onClick={() => handleToggleStatus(alert)}
                              title={
                                alert.status === "active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              <i
                                className={`fas fa-${
                                  alert.status === "active" ? "pause" : "play"
                                }`}
                              ></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(alert.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
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
    </div>
  );
};

export default JobAlertsManager;
