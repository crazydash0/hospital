const LABELS = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

const CLASSES = {
  PENDING: "badge badge-pending",
  CONFIRMED: "badge badge-confirmed",
  COMPLETED: "badge badge-completed",
  CANCELLED: "badge badge-cancelled",
};

function StatusBadge({ status }) {
  return (
    <span className={CLASSES[status] || "badge badge-pending"}>
      {LABELS[status] || status}
    </span>
  );
}

export default StatusBadge;
