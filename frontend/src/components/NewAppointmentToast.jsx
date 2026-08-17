import { useEffect } from "react";

function NewAppointmentToast({ count, onDismiss, onView }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 7000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 100,
        background: "var(--teal-900)",
        color: "#fff",
        borderRadius: "var(--radius)",
        padding: "14px 18px",
        boxShadow: "var(--shadow-md)",
        maxWidth: 320,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 22 }}>🔔</span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", fontSize: 14.5 }}>
          {count > 1 ? `عندك ${count} حجوزات جديدة` : "عندك حجز جديد"}
        </strong>
        <button
          onClick={onView}
          style={{
            background: "none",
            border: "none",
            color: "var(--teal-100)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
            marginTop: 4,
            textDecoration: "underline",
          }}
        >
          عرض المواعيد
        </button>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "var(--teal-100)",
          fontSize: 18,
          cursor: "pointer",
          padding: 0,
        }}
        aria-label="إغلاق"
      >
        ×
      </button>
    </div>
  );
}

export default NewAppointmentToast;
