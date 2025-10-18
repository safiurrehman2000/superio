export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  applicationId,
}) => {
  if (!isOpen) return null;

  const actionText = actionType === "accept" ? "Accepteren" : "Afwijzen";
  const actionBtnClass = actionType === "accept" ? "btn-success" : "btn-danger";

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: "calc(100% - 1rem)",
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Bevestig {actionText} Sollicitatie</h5>
          </div>
          <div className="modal-body">
            <p>
              Weet u zeker dat u deze sollicitatie wilt{" "}
              {actionText.toLowerCase()}?
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Annuleren
            </button>
            <button
              type="button"
              className={`btn ${actionBtnClass}`}
              onClick={() => onConfirm(applicationId, actionType)}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
