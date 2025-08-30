"use client";
import React, { useState } from "react";

const BrevoTestComponent = () => {
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Test User");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestBrevo = async () => {
    if (!testEmail) {
      alert("Please enter a test email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-brevo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail,
          testName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          messageId: data.messageId,
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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🧪 Brevo Email Integration Test</h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Test Email Address:
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter your email address"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Test Name (optional):
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Enter test name"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
      </div>

      <button
        onClick={handleTestBrevo}
        disabled={loading || !testEmail}
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
        {loading ? "Sending Test Email..." : "Send Test Email"}
      </button>

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
          {result.messageId && (
            <p>
              <strong>Message ID:</strong> {result.messageId}
            </p>
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
          <li>Enter your email address above</li>
          <li>Click "Send Test Email"</li>
          <li>Check your email inbox (and spam folder)</li>
          <li>If successful, your Brevo integration is working!</li>
        </ol>

        <h4>🔧 Setup Required:</h4>
        <ul>
          <li>
            Add <code>BREVO_API_KEY</code> to your environment variables
          </li>
          <li>
            Add <code>BREVO_SENDER_EMAIL</code> (optional, defaults to
            noreply@flexijobber.com)
          </li>
          <li>
            Add <code>BREVO_SENDER_NAME</code> (optional, defaults to
            Flexijobber)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BrevoTestComponent;
