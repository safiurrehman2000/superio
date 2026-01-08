"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/* =========================
   Toggle component
========================= */
const Toggle = ({ checked, disabled = false, onChange }) => {
  return (
    <div
      onClick={!disabled ? onChange : undefined}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "999px",
        backgroundColor: checked ? "#00B7EA" : "#ccc",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background-color 0.2s ease",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          transition: "left 0.2s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
};

/* =========================
   Cookie Popup
========================= */
const CookiePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("essential-cookies", "true");
    localStorage.setItem("analytics-enabled", "true");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", "custom");
    localStorage.setItem("essential-cookies", "true");
    localStorage.setItem(
      "analytics-enabled",
      analyticsEnabled ? "true" : "false"
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          zIndex: 9998,
        }}
      />

      {/* Center wrapper */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
        }}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "420px",
            padding: "32px 28px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: "20px" }}>
            <Image
              src="/images/logo-deflexijobber.png"
              alt="De Flexijobber"
              width={160}
              height={50}
              priority
            />
          </div>

          {!showSettings ? (
            <>
              <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
                Cookies & privacy 🍪
              </h2>

              <p
                style={{
                  fontSize: "14px",
                  color: "#555",
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                De Flexijobber gebruikt cookies om de website correct te laten
                werken en om inzicht te krijgen in het gebruik van onze diensten.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={handleAcceptAll}
                  style={{
                    width: "220px",
                    padding: "12px",
                    borderRadius: "30px",
                    backgroundColor: "#00B7EA",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Alles accepteren
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  style={{
                    width: "220px",
                    padding: "12px",
                    borderRadius: "30px",
                    backgroundColor: "#f2f2f2",
                    color: "#333",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Instellingen
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>
                Cookie-instellingen
              </h2>

              {/* Essentiële cookies */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <strong>Essentiële cookies</strong>
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    Nodig voor de werking van de website
                  </div>
                </div>

                <Toggle checked={true} disabled />
              </div>

              {/* Analytics cookies */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <strong>Analytische cookies</strong>
                  <div style={{ fontSize: "12px", color: "#777" }}>
                    Helpen ons de website te verbeteren
                  </div>
                </div>

                <Toggle
                  checked={analyticsEnabled}
                  onChange={() =>
                    setAnalyticsEnabled(!analyticsEnabled)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={handleSavePreferences}
                  style={{
                    width: "220px",
                    padding: "12px",
                    borderRadius: "30px",
                    backgroundColor: "#00B7EA",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Opslaan
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    width: "220px",
                    padding: "12px",
                    borderRadius: "30px",
                    backgroundColor: "#f2f2f2",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Terug
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CookiePopup;

