"use client";
import React, { useState } from "react";

const JobAlertTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [testMode, setTestMode] = useState(true);

  const handleSendJobAlerts = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/send-job-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testMode: testMode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Job alerts sent successfully!",
          data: data,
        });
      } else {
        setResult({
          success: false,
          error: data.error,
          details: data.details,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Network error",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestJob = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testJob = {
        title: "Test Job - Software Developer",
        description:
          "This is a test job for testing job alerts. We are looking for a skilled software developer.",
        company: "Test Company",
        location: "Brussels",
        tags: ["Software Development", "JavaScript", "React"],
        employerId: "test-employer-id",
        salary: "€50,000 - €70,000",
        jobType: "Full-time",
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testJob),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Test job created successfully!",
          data: data,
        });
      } else {
        setResult({
          success: false,
          error: data.error,
          details: data.details,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Network error",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🧪 Job Alert Testing Component</h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            style={{ marginRight: "10px" }}
          />
          Test Mode (won't send real emails)
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={handleSendJobAlerts}
          disabled={loading}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Job Alerts"}
        </button>

        <button
          onClick={handleCreateTestJob}
          disabled={loading}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Creating..." : "Create Test Job"}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "4px",
            backgroundColor: result.success ? "#d4edda" : "#f8d7da",
            border: `1px solid ${result.success ? "#c3e6cb" : "#f5c6cb"}`,
            color: result.success ? "#155724" : "#721c24",
          }}
        >
          <h4>{result.success ? "✅ Success!" : "❌ Error"}</h4>
          <p>
            <strong>Message:</strong> {result.message || result.error}
          </p>
          {result.data && (
            <div>
              <strong>Data:</strong>
              <pre
                style={{
                  backgroundColor: "rgba(0,0,0,0.1)",
                  padding: "10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
          {result.details && (
            <div>
              <strong>Details:</strong>
              <pre
                style={{
                  backgroundColor: "rgba(0,0,0,0.1)",
                  padding: "10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                {result.details}
              </pre>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <h4>📋 Instructions:</h4>
        <ol>
          <li>
            <strong>Send Job Alerts:</strong> Triggers job alerts for all
            candidates with active alerts
          </li>
          <li>
            <strong>Create Test Job:</strong> Creates a test job that should
            trigger alerts for matching candidates
          </li>
          <li>Check the console for detailed logs</li>
          <li>Check recipient emails for job alert emails</li>
        </ol>

        <h4>🔧 How it works:</h4>
        <ul>
          <li>
            When you create a job, it automatically checks all candidates with
            job alerts
          </li>
          <li>
            If a job matches a candidate's alert preferences, they get an
            immediate email
          </li>
          <li>You can also manually trigger job alerts for all candidates</li>
        </ul>
      </div>
    </div>
  );
};

export default JobAlertTestComponent;
