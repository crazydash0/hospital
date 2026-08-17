import { useState, useEffect } from "react";
import api from "../api/axios";
import WeeklyScheduleTable from "../components/WeeklyScheduleTable";
import ConfirmModal from "../components/ConfirmModal";

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
  const [leaves, setLeaves] = useState([]);
  const [fromDay, setFromDay] = useState("0");
  const [toDay, setToDay] = useState("4");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [duration, setDuration] = useState("30");
  const [note, setNote] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLeaveTarget, setDeleteLeaveTarget] = useState(null);

  async function fetchTemplate() {
    try {
      const response = await api.get("/appointments/weekly-template");
      setTemplate(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchLeaves() {
    try {
      const response = await api.get("/appointments/leaves");
      setLeaves(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchTemplate();
    fetchLeaves();
  }, []);

  function showResult(promise, successMsg) {
    setMessage("");
    setError("");
    return promise
      .then(() => setMessage(successMsg))
      .catch((err) => setError(err.response?.data?.message || "حصل خطأ، حاول تاني"));
  }

  async function handleSaveRange(e) {
    e.preventDefault();
    if (Number(fromDay) > Number(toDay)) {
      setError("يوم البداية لازم يكون قبل يوم النهاية");
      return;
    }
    await showResult(
      api.post("/appointments/weekly-template/range", {
        fromDay: Number(fromDay),
        toDay: Number(toDay),
        startHour: Number(startHour),
        endHour: Number(endHour),
        duration: Number(duration),
        note: note.trim() || undefined,
      }),
      `تم حفظ الجدول من ${DAYS[fromDay]} إلى ${DAYS[toDay]} بنجاح.`
    );
    fetchTemplate();
  }

  async function handleDeleteDay() {
    setError("");
    try {
      await api.delete(`/appointments/weekly-template/${deleteTarget}`);
      setMessage(`تم حذف يوم ${DAYS[deleteTarget]} من الجدول.`);
      setDeleteTarget(null);
      fetchTemplate();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ، حاول تاني");
      setDeleteTarget(null);
    }
  }

  async function handleAddLeave(e) {
    e.preventDefault();
    await showResult(
      api.post("/appointments/leaves", { date: leaveDate }),
      "تم إضافة يوم الإجازة."
    );
    setLeaveDate("");
    fetchLeaves();
  }

  async function handleDeleteLeave() {
    setError("");
    try {
      await api.delete(`/appointments/leaves/${deleteLeaveTarget.id}`);
      setMessage("تم إلغاء يوم الإجازة.");
      setDeleteLeaveTarget(null);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ، حاول تاني");
      setDeleteLeaveTarget(null);
    }
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

  return (
    <div className="page">
      <div className="page-head">
        <h1>الجدول الأسبوعي</h1>
        <p className="subtitle">
          حدّد أيام وساعات شغلك، ممكن تختار نطاق أيام مرة واحدة (زي من الأحد للثلاثاء) وتضيف تعليق زي اسم العيادة.
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="section">
        <h2>جدولك الحالي</h2>
        <WeeklyScheduleTable
          template={template}
          editable
          onDeleteDay={(day) => setDeleteTarget(day)}
        />
      </div>

      <div className="grid grid-2 section">
        <div className="card">
          <h2>تحديد نطاق أيام</h2>
          <form onSubmit={handleSaveRange}>
            <div className="form-grid">
              <div className="field">
                <label>من يوم</label>
                <select value={fromDay} onChange={(e) => setFromDay(e.target.value)}>
                  {DAYS.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>إلى يوم</label>
                <select value={toDay} onChange={(e) => setToDay(e.target.value)}>
                  {DAYS.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>من الساعة</label>
                <input
                  type="number"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  min="0"
                  max="23"
                  required
                />
              </div>
              <div className="field">
                <label>إلى الساعة</label>
                <input
                  type="number"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  min="1"
                  max="23"
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
                min="5"
                max="240"
                required
              />
            </div>
            <div className="field">
              <label>تعليق (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: عيادة المعادي"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <span className="hint">هيظهر جنب كل يوم في النطاق ده، زي اسم العيادة أو الفرع.</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              حفظ النطاق
            </button>
          </form>
        </div>

        <div className="card">
          <h2>أيام الإجازة</h2>
          <form onSubmit={handleAddLeave} style={{ marginBottom: 18 }}>
            <div className="field">
              <label>إضافة يوم إجازة</label>
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

          {leaves.length === 0 ? (
            <p className="muted" style={{ fontSize: 14 }}>مفيش أيام إجازة قادمة.</p>
          ) : (
            <div className="stack">
              {leaves.map((leave) => (
                <div key={leave.id} className="card-row">
                  <span>
                    {new Date(leave.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteLeaveTarget(leave)}
                  >
                    إلغاء
                  </button>
                </div>
              ))}
            </div>
          )}

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

      {deleteTarget !== null && (
        <ConfirmModal
          title="حذف يوم من الجدول"
          message={`هل أنت متأكد من حذف يوم ${DAYS[deleteTarget]} بالكامل من جدولك الأسبوعي؟`}
          confirmLabel="نعم، احذف اليوم"
          danger
          onConfirm={handleDeleteDay}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deleteLeaveTarget && (
        <ConfirmModal
          title="إلغاء يوم الإجازة"
          message="هل أنت متأكد من إلغاء يوم الإجازة ده؟ هيرجع يوم شغل عادي."
          confirmLabel="نعم، ألغِ الإجازة"
          danger
          onConfirm={handleDeleteLeave}
          onClose={() => setDeleteLeaveTarget(null)}
        />
      )}
    </div>
  );
}

export default WeeklySchedule;
