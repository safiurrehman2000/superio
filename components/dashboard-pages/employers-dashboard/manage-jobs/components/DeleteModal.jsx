export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,

  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#ff4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <span
              className="la la-exclamation-triangle"
              style={{ color: "white", fontSize: "18px" }}
            ></span>
          </div>
          <h3 style={{ margin: 0, color: "#333" }}>Delete Job Posting</h3>
        </div>

        <div className="modal-body" style={{ marginBottom: "24px" }}>
          <p style={{ margin: "0 0 12px 0", color: "#666", lineHeight: "1.5" }}>
            Are you sure you want to delete this job posting?
          </p>
          <p
            style={{
              margin: 0,
              color: "#ff4444",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            <strong>Warning:</strong> This action cannot be undone and will
            permanently remove:
          </p>
          <ul
            style={{
              margin: "8px 0 0 0",
              paddingLeft: "20px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            <li>All applications for this job</li>
            <li>All saved job entries</li>
            <li>All view tracking data</li>
            <li>The job posting itself</li>
          </ul>
        </div>

        <div
          className="modal-footer"
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: "10px 20px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              color: "#666",
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#ff4444",
              color: "white",
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isDeleting && <span className="la la-spinner la-spin"></span>}
            {isDeleting ? "Verwijderen..." : "Job Verwijderen"}
          </button>
        </div>
      </div>
    </div>
  );
};
