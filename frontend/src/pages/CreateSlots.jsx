import { useState } from "react";
import api from "../api/axios";

function CreateSlots() {
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [duration, setDuration] = useState("30");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      await api.post("/appointments/slots", {
        date,
        startHour: Number(startHour),
        endHour: Number(endHour),
        duration: Number(duration),
      });
      setMessage("تم إضافة المواعيد بنجاح ✅");
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء إضافة المواعيد");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card form-card">
        <div className="page-head">
          <h1>إضافة مواعيد فاضية</h1>
          <p className="subtitle">حدد يوم معين وهنقسمه لمواعيد حسب المدة اللي تختارها.</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>من الساعة (مثال: 9)</label>
              <input
                type="number"
                placeholder="9"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                min="0"
                max="23"
                required
              />
            </div>
            <div className="field">
              <label>إلى الساعة (مثال: 17)</label>
              <input
                type="number"
                placeholder="17"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                min="0"
                max="23"
                required
              />
            </div>
          </div>
          <div className="field">
            <label>مدة الموعد بالدقايق</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              max="240"
              list="duration-options"
              required
            />
            <datalist id="duration-options">
              <option value="15" />
              <option value="30" />
              <option value="45" />
              <option value="60" />
            </datalist>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "جاري الإضافة..." : "إضافة المواعيد"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSlots;
