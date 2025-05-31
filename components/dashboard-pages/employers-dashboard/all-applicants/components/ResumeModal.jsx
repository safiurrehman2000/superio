export const ResumeModal = ({ isOpen, onClose, resumeUrl, fileName }) => {
  if (!isOpen) return null;

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
      >
        <button
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
        <h3>{fileName || "Resume"}</h3>
        {resumeUrl ? (
          <iframe
            src={resumeUrl}
            style={{ width: "100%", height: "500px", border: "none" }}
            title="Resume Preview"
          />
        ) : (
          <p>No resume available</p>
        )}
        {resumeUrl && (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <a
              href={resumeUrl}
              download={fileName}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "4px",
              }}
            >
              Download Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
