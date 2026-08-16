import { useState } from "react";

function ConfirmModal({
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "تراجع",
  danger = false,
  onConfirm,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="muted" style={{ margin: "10px 0 20px" }}>
          {message}
        </p>
        <div className="row">
          <button
            className={danger ? "btn btn-danger" : "btn btn-primary"}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "جاري التنفيذ..." : confirmLabel}
          </button>
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
