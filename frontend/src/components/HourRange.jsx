function pad(h) {
  return String(h).padStart(2, "0");
}

// Displays a time range safely inside RTL text, avoiding the classic
// bidi bug where "9:00 - 17:00" renders in the wrong visual order.
function HourRange({ startHour, endHour, duration }) {
  return (
    <span>
      من{" "}
      <bdi style={{ fontWeight: 700, color: "var(--teal-800)" }}>
        {pad(startHour)}:00
      </bdi>{" "}
      إلى{" "}
      <bdi style={{ fontWeight: 700, color: "var(--teal-800)" }}>
        {pad(endHour)}:00
      </bdi>
      {duration != null && (
        <span className="muted"> ({duration} دقيقة لكل موعد)</span>
      )}
    </span>
  );
}

export default HourRange;
