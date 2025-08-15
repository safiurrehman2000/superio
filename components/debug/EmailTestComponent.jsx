"use client";

import { useState } from "react";
import { sendWelcomeEmail } from "@/utils/email-service";
import { runFullEmailDebug, sendTestEmailWithDebug } from "@/utils/email-debug";
import {
  debugChargingIssue,
  debugEmailJSResponse,
} from "@/utils/email-debug-advanced";

/**
 * Email Test Component - Use this to debug email issues
 * Add this component temporarily to test email functionality
 */
const EmailTestComponent = () => {
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setResults((prev) => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setResults([]);
    console.clear();
  };

  const handleTestWelcomeEmail = async () => {
    if (!testEmail) {
      addResult("❌ Please enter an email address", "error");
      return;
    }

    setIsLoading(true);
    addResult(`🧪 Testing welcome email to: ${testEmail}`, "info");

    try {
      const success = await sendWelcomeEmail(
        testEmail,
        testName || "Test User",
        "Candidate"
      );
      if (success) {
        addResult(`✅ Email sent successfully to: ${testEmail}`, "success");
      } else {
        addResult(`❌ Email failed to send to: ${testEmail}`, "error");
      }
    } catch (error) {
      addResult(`💥 Error: ${error.message}`, "error");
    }

    setIsLoading(false);
  };

  const handleFullDebug = async () => {
    if (!testEmail) {
      addResult("❌ Please enter an email address", "error");
      return;
    }

    setIsLoading(true);
    addResult(`🔍 Running full debug for: ${testEmail}`, "info");

    try {
      const result = await runFullEmailDebug(testEmail);
      if (result.success) {
        addResult(`✅ Full debug completed successfully`, "success");
      } else {
        addResult(`❌ Full debug failed: ${result.error?.message}`, "error");
      }
    } catch (error) {
      addResult(`💥 Debug error: ${error.message}`, "error");
    }

    setIsLoading(false);
  };

  const handleChargingDebug = async () => {
    if (!testEmail) {
      addResult("❌ Please enter an email address", "error");
      return;
    }

    setIsLoading(true);
    addResult(`🚨 Running charging issue debug for: ${testEmail}`, "info");

    try {
      const result = await debugChargingIssue(testEmail);
      addResult(
        `🔍 Charging debug completed - check console for details`,
        "info"
      );

      if (result.apiCallSuccess && result.charged) {
        addResult(
          `💰 You're being charged but emails not delivered = Config issue`,
          "error"
        );
      } else if (!result.serviceAccessible) {
        addResult(`🔌 Service not accessible - network issue`, "error");
      }
    } catch (error) {
      addResult(`💥 Charging debug error: ${error.message}`, "error");
    }

    setIsLoading(false);
  };

  const handleTestEmailWithDebug = async () => {
    if (!testEmail) {
      addResult("❌ Please enter an email address", "error");
      return;
    }

    setIsLoading(true);
    addResult(`🧪 Testing email with full debug to: ${testEmail}`, "info");

    try {
      const result = await sendTestEmailWithDebug(
        testEmail,
        testName || "Test User"
      );
      if (result.success) {
        addResult(`✅ Debug test email sent successfully`, "success");
      } else {
        addResult(`❌ Debug test email failed`, "error");
      }
    } catch (error) {
      addResult(`💥 Debug test error: ${error.message}`, "error");
    }

    setIsLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #007bff",
        borderRadius: "8px",
        margin: "20px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h3 style={{ color: "#007bff", marginTop: 0 }}>
        📧 Email Debug Test Component
      </h3>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Test Email Address:
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="recipient@example.com"
            style={{
              width: "300px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Test Name (optional):
          </label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test User"
            style={{
              width: "300px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleTestWelcomeEmail}
          disabled={isLoading}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          {isLoading ? "⏳ Sending..." : "📧 Test Welcome Email"}
        </button>

        <button
          onClick={handleTestEmailWithDebug}
          disabled={isLoading}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          {isLoading ? "⏳ Debugging..." : "🔍 Test with Debug"}
        </button>

        <button
          onClick={handleFullDebug}
          disabled={isLoading}
          style={{
            backgroundColor: "#ffc107",
            color: "black",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          {isLoading ? "⏳ Debugging..." : "🚀 Full Debug"}
        </button>

        <button
          onClick={handleChargingDebug}
          disabled={isLoading}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          {isLoading ? "⏳ Analyzing..." : "🚨 Debug Charging Issue"}
        </button>

        <button
          onClick={clearResults}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🗑️ Clear
        </button>
      </div>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          backgroundColor: "#000",
          color: "#00ff00",
          padding: "15px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "10px", color: "#fff" }}>
          <strong>📊 Test Results & Console Output:</strong>
        </div>
        {results.length === 0 ? (
          <div style={{ color: "#ccc" }}>
            No tests run yet. Check browser console for detailed logs.
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              style={{
                marginBottom: "5px",
                color:
                  result.type === "error"
                    ? "#ff6b6b"
                    : result.type === "success"
                    ? "#51cf66"
                    : "#74c0fc",
              }}
            >
              <span style={{ color: "#aaa" }}>[{result.timestamp}]</span>{" "}
              {result.message}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#e7f3ff",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <strong>💡 Instructions:</strong>
        <ol style={{ margin: "10px 0", paddingLeft: "20px" }}>
          <li>
            Enter a test email address (different from your EmailJS account)
          </li>
          <li>Click "Test Welcome Email" to test normal flow</li>
          <li>Click "Test with Debug" for detailed logging</li>
          <li>Check browser console for detailed debug information</li>
          <li>Check if the test email was received by the recipient</li>
        </ol>
        <div style={{ marginTop: "10px", color: "#666" }}>
          <strong>🔍 What to look for:</strong> In console logs, verify that "TO
          (Recipient)" shows the correct email address, not your email.
        </div>
      </div>
    </div>
  );
};

export default EmailTestComponent;
