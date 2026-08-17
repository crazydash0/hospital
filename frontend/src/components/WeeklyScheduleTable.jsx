import HourRange from "./HourRange";

const DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// عرض جدول أسبوعي بشكل واضح لكل الأيام السبعة، مع تعليق كل يوم لو موجود
function WeeklyScheduleTable({ template, onDeleteDay, editable = false }) {
  const byDay = new Map(template.map((t) => [t.dayOfWeek, t]));

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {DAYS.map((dayName, index) => {
            const entry = byDay.get(index);
            return (
              <tr
                key={index}
                style={{
                  borderBottom: index < 6 ? "1px solid var(--border)" : "none",
                }}
              >
                <td style={{ padding: "12px 16px", width: 110, fontWeight: 700, color: "var(--teal-900)" }}>
                  {dayName}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {entry ? (
                    <div>
                      <HourRange
                        startHour={entry.startHour}
                        endHour={entry.endHour}
                        duration={entry.duration}
                      />
                      {entry.note && (
                        <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                          📍 {entry.note}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="muted">غير متاح</span>
                  )}
                </td>
                {editable && (
                  <td style={{ padding: "12px 16px", width: 110, textAlign: "left" }}>
                    {entry && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteDay(index)}
                      >
                        حذف
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyScheduleTable;
