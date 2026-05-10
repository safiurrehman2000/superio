"use client";
import { errorToast, successToast } from "@/utils/toast";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";

const OptionsManager = () => {
  const [states, setStates] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("states");
  const [submitting, setSubmitting] = useState(false);

  // Form setup
  const methods = useForm({
    defaultValues: {
      value: "",
      label: "",
    },
  });

  const { handleSubmit, reset, watch } = methods;

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);

      // Fetch states
      console.log("Fetching states...");
      const statesResponse = await fetch(
        "/api/admin/manage-options?type=states"
      );
      const statesData = await statesResponse.json();
      console.log("States response:", statesData);
      if (statesData.data) {
        setStates(statesData.data);
      }

      // Fetch sectors
      console.log("Fetching sectors...");
      const sectorsResponse = await fetch(
        "/api/admin/manage-options?type=sectors"
      );
      const sectorsData = await sectorsResponse.json();
      console.log("Sectors response:", sectorsData);
      if (sectorsData.data) {
        setSectors(sectorsData.data);
      }

      const jobTypesResponse = await fetch(
        "/api/admin/manage-options?type=job_types"
      );
      const jobTypesData = await jobTypesResponse.json();
      if (jobTypesData.data) {
        setJobTypes(jobTypesData.data);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      errorToast("Failed to fetch options");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async (data) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/manage-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activeTab,
          value: data.value.trim().toLowerCase().replace(/\s+/g, "-"),
          label: data.label.trim(),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        successToast(
          activeTab === "states"
            ? "State added successfully"
            : activeTab === "sectors"
              ? "Sector added successfully"
              : "Job type added successfully"
        );
        reset(); // Reset form
        fetchOptions(); // Refresh the list
      } else {
        errorToast(responseData.error || "Failed to add option");
      }
    } catch (error) {
      console.error("Error adding option:", error);
      errorToast("Failed to add option");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = async (value) => {
    if (!confirm("Are you sure you want to delete this option?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/manage-options?type=${activeTab}&value=${value}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        successToast(
          activeTab === "states"
            ? "State deleted successfully"
            : activeTab === "sectors"
              ? "Sector deleted successfully"
              : "Job type deleted successfully"
        );
        fetchOptions(); // Refresh the list
      } else {
        errorToast(data.error || "Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      errorToast("Failed to delete option");
    }
  };

  const currentOptions =
    activeTab === "states"
      ? states
      : activeTab === "sectors"
        ? sectors
        : jobTypes;

  // Debug logging
  console.log("Current states:", states);
  console.log("Current sectors:", sectors);
  console.log("Active tab:", activeTab);
  console.log("Current options:", currentOptions);

  if (loading) {
    return (
      <div className="ls-widget">
        <div className="widget-title">
          <h4>Manage Options</h4>
        </div>
        <div className="widget-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-widget">
      <div className="widget-title">
        <h4>Manage Options</h4>
      </div>
      <div className="widget-content">
        {/* Tabs */}
        <div className="form-group" style={{ marginBottom: "30px" }}>
          <h5 style={{ marginBottom: "15px", color: "#1967d2" }}>
            Select Option Type
          </h5>
          <div className="row g-2">
            <div className="col-md-4">
              <button
                className={`btn btn-lg w-100 ${
                  activeTab === "states" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("states")}
                style={{
                  padding: "15px 20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "2px solid",
                  transition: "all 0.3s ease",
                }}
              >
                📍 States ({states.length})
              </button>
            </div>
            <div className="col-md-4">
              <button
                className={`btn btn-lg w-100 ${
                  activeTab === "sectors"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("sectors")}
                style={{
                  padding: "15px 20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "2px solid",
                  transition: "all 0.3s ease",
                }}
              >
                🏢 Sectors ({sectors.length})
              </button>
            </div>
            <div className="col-md-4">
              <button
                className={`btn btn-lg w-100 ${
                  activeTab === "job_types"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("job_types")}
                style={{
                  padding: "15px 20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "2px solid",
                  transition: "all 0.3s ease",
                }}
              >
                💼 Job types ({jobTypes.length})
              </button>
            </div>
          </div>
        </div>

        {/* Active Tab Indicator */}
        <div
          className="alert alert-info"
          style={{
            marginTop: "20px",
            backgroundColor: "#e3f2fd",
            borderColor: "#2196f3",
            color: "#0d47a1",
          }}
        >
          <strong>Currently Managing:</strong>{" "}
          {activeTab === "states"
            ? "States"
            : activeTab === "sectors"
              ? "Sectors"
              : "Job types"}{" "}
          ({currentOptions.length} items)
        </div>

        {/* Add New Option Form */}
        <div className="form-group" style={{ marginTop: "30px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            Add New{" "}
            {activeTab === "states"
              ? "State"
              : activeTab === "sectors"
                ? "Sector"
                : "Job Type"}
          </h5>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleAddOption)} className="row">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Value (URL-friendly)"
                  name="value"
                  placeholder="e.g., new-state"
                  required={true}
                  fieldType="Text"
                  disabled={submitting}
                />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                <InputField
                  label="Label (Display Name)"
                  name="label"
                  placeholder="e.g., New State"
                  required={true}
                  fieldType="Name"
                  disabled={submitting}
                />
              </div>
              <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                <button
                  type="submit"
                  className="theme-btn btn-style-one"
                  disabled={submitting}
                  style={{ marginTop: "10px" }}
                >
                  {submitting
                    ? "Adding..."
                    : `Add ${
                        activeTab === "states"
                          ? "State"
                          : activeTab === "sectors"
                            ? "Sector"
                            : "Job Type"
                      }`}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Options List */}
        <div className="form-group" style={{ marginTop: "40px" }}>
          <h5 style={{ marginBottom: "20px", color: "#1967d2" }}>
            Current{" "}
            {activeTab === "states"
              ? "States"
              : activeTab === "sectors"
                ? "Sectors"
                : "Job Types"}
          </h5>
          {currentOptions.length === 0 ? (
            <div className="alert alert-info">
              No {activeTab} found. Add some using the form above.
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
                      Value
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Label
                    </th>
                    <th style={{ fontWeight: "600", color: "#1967d2" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOptions.map((option, index) => (
                    <tr key={index}>
                      <td>
                        <code
                          style={{
                            background: "#f8f9fa",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {option.value}
                        </code>
                      </td>
                      <td>{option.label}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteOption(option.value)}
                          className="btn btn-sm btn-danger"
                          disabled={submitting}
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Delete
                        </button>
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

export default OptionsManager;
