import { useState, useEffect } from "react";
import api from "../api/axios";

const DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function WeeklySchedule() {
  const [template, setTemplate] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [duration, setDuration] = useState("30");
  const [leaveDate, setLeaveDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchTemplate() {
    try {
      const response = await api.get("/appointments/weekly-template");
      setTemplate(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchTemplate();
  }, []);

  function showResult(promise, successMsg) {
    setMessage("");
    setError("");
    return promise
      .then(() => setMessage(successMsg))
      .catch((err) => setError(err.response?.data?.message || "حصل خطأ، حاول تاني"));
  }

  async function handleSaveDay(e) {
    e.preventDefault();
    await showResult(
      api.post("/appointments/weekly-template", {
        dayOfWeek: Number(dayOfWeek),
        startHour: Number(startHour),
        endHour: Number(endHour),
        duration: Number(duration),
      }),
      "تم حفظ اليوم بنجاح."
    );
    fetchTemplate();
  }

  async function handleAddLeave(e) {
    e.preventDefault();
    await showResult(
      api.post("/appointments/leaves", { date: leaveDate }),
      "تم إضافة يوم الإجازة."
    );
    setLeaveDate("");
  }

  async function handleGenerateWeek() {
    setMessage("");
    setError("");
    try {
      const response = await api.post("/appointments/generate-week");
      setMessage(
        `تم إنشاء ${response.data.totalCreated} موعد. الأيام المتخطاة: ${
          response.data.skippedDays.join("، ") || "لا يوجد"
        }`
      );
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ، حاول تاني");
    }
  }

  function handleSelectDay(day) {
    setDayOfWeek(String(day.dayOfWeek));
    setStartHour(String(day.startHour));
    setEndHour(String(day.endHour));
    setDuration(String(day.duration));
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>الجدول الأسبوعي</h1>
        <p className="subtitle">حدد أيام وساعات شغلك الأسبوعية، وولّد مواعيد الأسبوع الجاي بضغطة واحدة.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="section">
        <h2>الجدول الحالي</h2>
        {template.length === 0 ? (
          <div className="empty-state">لسه ماحددتش أي أيام.</div>
        ) : (
          <div className="stack">
            {template.map((day) => (
              <div key={day.id} className="card-row">
                <span>
                  {DAYS[day.dayOfWeek]}: {day.startHour}:00 - {day.endHour}:00 ({day.duration} دقيقة)
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => handleSelectDay(day)}>
                  تعديل
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-2 section">
        <div className="card">
          <h2>تحديد / تعديل يوم</h2>
          <form onSubmit={handleSaveDay}>
            <div className="field">
              <label>اليوم</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                {DAYS.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>من الساعة</label>
                <input
                  type="number"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>إلى الساعة</label>
                <input
                  type="number"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>مدة الموعد (دقايق)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              حفظ اليوم
            </button>
          </form>
        </div>

        <div className="card">
          <h2>إضافة يوم إجازة</h2>
          <form onSubmit={handleAddLeave}>
            <div className="field">
              <label>التاريخ</label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-outline btn-block">
              إضافة إجازة
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <h2>توليد مواعيد الأسبوع القادم</h2>
            <p className="muted" style={{ marginBottom: 12, fontSize: 14 }}>
              هيتم إنشاء المواعيد تلقائيًا حسب جدولك الأسبوعي، ومراعاة أيام الإجازة.
            </p>
            <button className="btn btn-accent btn-block" onClick={handleGenerateWeek}>
              توليد الأسبوع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklySchedule;
