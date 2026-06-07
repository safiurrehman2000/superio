"use client";

import { useEffect, useState } from "react";
import {
  createResumeObjectUrl,
  downloadResume,
  isPdfResume,
  truncateFileName,
} from "@/utils/resumeHelperFunctions";

export const ResumeModal = ({ isOpen, onClose, resume }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!isOpen || !resume?.fileData) {
      setPreviewUrl(null);
      return undefined;
    }

    const url = createResumeObjectUrl(resume);
    setPreviewUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, resume]);

  if (!isOpen) return null;

  const fileName = resume?.fileName || "Resume";
  const displayName = truncateFileName(fileName, 40);
  const canPreview = Boolean(previewUrl && isPdfResume(resume));
  const canDownload = Boolean(resume?.fileData);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "80%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <h3 title={fileName}>{displayName}</h3>
        {canPreview ? (
          <iframe
            src={previewUrl}
            style={{ width: "100%", height: "500px", border: "none" }}
            title="Resume Preview"
          />
        ) : canDownload ? (
          <p style={{ color: "#666", margin: "24px 0" }}>
            Preview is only available for PDF files. Download the Word document
            below.
          </p>
        ) : (
          <p>No resume available</p>
        )}
        {canDownload && (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => downloadResume(resume)}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Download Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
