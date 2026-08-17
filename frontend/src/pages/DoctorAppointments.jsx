import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ContactChip from "../components/ContactChip";

const emptyRx = () => ({
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

function CompleteVisitModal({ appointment, onClose, onDone }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [prescriptions, setPrescriptions] = useState([emptyRx()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateRx(index, field, value) {
    setPrescriptions((prev) =>
      prev.map((rx, i) => (i === index ? { ...rx, [field]: value } : rx))
    );
  }

  function addRx() {
    setPrescriptions((prev) => [...prev, emptyRx()]);
  }

  function removeRx(index) {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!diagnosis.trim()) {
      setError("لازم تكتب التشخيص");
      return;
    }

    const cleanedRx = prescriptions.filter((rx) => rx.medicineName.trim());

    setSubmitting(true);
    try {
      await api.post("/medical-records", {
        appointmentId: appointment.id,
        diagnosis,
        notes: notes || undefined,
        additionalInstructions: additionalInstructions || undefined,
        prescriptions: cleanedRx,
      });
      await api.patch(`/appointments/${appointment.id}/complete`);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء حفظ الزيارة");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>إنهاء الزيارة — {appointment.patient.fullName}</h2>
        <p className="muted" style={{ marginBottom: 14, fontSize: 14 }}>
          سجّل التشخيص والروشتة عشان تتحفظ في السجل الطبي للمريض.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>التشخيص *</label>
            <input
              type="text"
              placeholder="مثال: التهاب الجيوب الأنفية الحاد"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>ملاحظات</label>
            <textarea
              placeholder="حالة المريض بشكل عام..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="field">
            <label>تعليمات إضافية</label>
            <textarea
              placeholder="راحة، شرب مياه بكثرة..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
            />
          </div>

          <div className="field">
            <label>الروشتة</label>
            {prescriptions.map((rx, i) => (
              <div key={i} className="rx-row">
                <input
                  type="text"
                  placeholder="اسم الدواء"
                  value={rx.medicineName}
                  onChange={(e) => updateRx(i, "medicineName", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="الجرعة (مثال: 500 مج)"
                  value={rx.dosage}
                  onChange={(e) => updateRx(i, "dosage", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="عدد المرات (مثال: مرتين يوميًا)"
                  value={rx.frequency}
                  onChange={(e) => updateRx(i, "frequency", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="المدة (مثال: 5 أيام)"
                  value={rx.duration}
                  onChange={(e) => updateRx(i, "duration", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="تعليمات (اختياري)"
                  value={rx.instructions}
                  onChange={(e) => updateRx(i, "instructions", e.target.value)}
                  style={{ gridColumn: "1 / -1" }}
                />
                {prescriptions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ gridColumn: "1 / -1" }}
                    onClick={() => removeRx(i)}
                  >
                    حذف الدواء
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addRx}>
              + إضافة دواء آخر
            </button>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "حفظ وإنهاء الزيارة"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MeetingLinkControl({ appointment, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(appointment.meetingLink || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (link.trim().length < 5) {
      setError("رابط الجلسة قصير جدًا");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/appointments/${appointment.id}/meeting-link`, {
        meetingLink: link.trim(),
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء حفظ الرابط");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    try {
      await api.delete(`/appointments/${appointment.id}/meeting-link`);
      setLink("");
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} style={{ marginTop: 8, width: "100%" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="row wrap">
          <input
            type="text"
            placeholder="رابط Google Meet أو Zoom"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
            إلغاء
          </button>
        </div>
      </form>
    );
  }

  return appointment.meetingLink ? (
    <div className="row wrap" style={{ marginTop: 8, gap: 8 }}>
      <a
        href={appointment.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-accent btn-sm"
      >
        🎥 رابط الجلسة الأونلاين
      </a>
      <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
        تعديل
      </button>
      <button className="btn btn-danger btn-sm" onClick={handleRemove} disabled={submitting}>
        إزالة
      </button>
    </div>
  ) : (
    <button
      className="btn btn-outline btn-sm"
      style={{ marginTop: 8 }}
      onClick={() => setEditing(true)}
    >
      🎥 إضافة رابط جلسة أونلاين
    </button>
  );
}

function StatsBar({ stats }) {
  if (!stats) return null;
  const items = [
    { label: "إجمالي المواعيد", value: stats.totalAppointments, color: "var(--teal-800)" },
    { label: "قيد الانتظار", value: stats.pendingAppointments, color: "var(--amber-600)" },
    { label: "مؤكدة", value: stats.confirmedAppointments, color: "var(--teal-700)" },
    { label: "مكتملة", value: stats.completedAppointments, color: "var(--green-600)" },
    { label: "ملغاة", value: stats.cancelledAppointments, color: "var(--red-600)" },
  ];
  return (
    <div className="grid grid-3 section" style={{ marginTop: 0, marginBottom: 30 }}>
      {items.map((item) => (
        <div key={item.label} className="card center">
          <div style={{ fontSize: 30, fontFamily: "var(--display)", fontWeight: 700, color: item.color }}>
            {item.value ?? 0}
          </div>
          <div className="muted" style={{ fontSize: 13.5 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("UPCOMING");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  async function fetchAppointments() {
    try {
      const response = await api.get("/appointments/doctor");
      setAppointments(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchStats() {
    try {
      const response = await api.get("/dashboard/doctor");
      setStats(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  async function handleConfirm(id) {
    setMessage("");
    setError("");
    try {
      await api.patch(`/appointments/${id}/confirm`);
      setMessage("تم تأكيد الموعد.");
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء التأكيد");
    }
  }

  async function handleCancel() {
    setError("");
    try {
      await api.patch(`/appointments/${cancelTarget.id}/doctor-cancel`);
      setCancelTarget(null);
      setMessage("تم إلغاء الموعد.");
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء الإلغاء");
      setCancelTarget(null);
    }
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.slot.startTime) - new Date(b.slot.startTime)
  );

  const filtered = sorted.filter((a) =>
    tab === "UPCOMING"
      ? a.status === "PENDING" || a.status === "CONFIRMED"
      : tab === "COMPLETED"
      ? a.status === "COMPLETED"
      : a.status === "CANCELLED"
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1>مواعيدي</h1>
        <p className="subtitle">أكّد المواعيد الجديدة، وسجّل التشخيص والروشتة بعد كل زيارة.</p>
      </div>

      <StatsBar stats={stats} />

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        <button className={tab === "UPCOMING" ? "tab active" : "tab"} onClick={() => setTab("UPCOMING")}>
          القادمة
        </button>
        <button className={tab === "COMPLETED" ? "tab active" : "tab"} onClick={() => setTab("COMPLETED")}>
          المكتملة
        </button>
        <button className={tab === "CANCELLED" ? "tab active" : "tab"} onClick={() => setTab("CANCELLED")}>
          الملغاة
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">مفيش مواعيد في هذا القسم.</div>
      ) : (
        <div className="stack">
          {filtered.map((appt) => (
            <div key={appt.id} className="card">
              <div className="row between wrap">
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <div className="doctor-avatar">{(appt.patient.fullName || "م")[0]}</div>
                  <div>
                    <h3 style={{ marginBottom: 2 }}>
                      <Link to={`/patients/${appt.patient.id}`}>{appt.patient.fullName}</Link>
                    </h3>
                    <span className="muted" style={{ fontSize: 14 }}>
                      {new Date(appt.slot.startTime).toLocaleString("ar-EG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <ContactChip email={appt.patient.user?.email} phone={appt.patient.phone} />
                    {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                      <MeetingLinkControl appointment={appt} onChanged={fetchAppointments} />
                    )}
                  </div>
                </div>
                <div className="row wrap">
                  <StatusBadge status={appt.status} />
                  {appt.status === "PENDING" && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(appt.id)}>
                      تأكيد
                    </button>
                  )}
                  {appt.status === "CONFIRMED" && (
                    <button className="btn btn-accent btn-sm" onClick={() => setCompleteTarget(appt)}>
                      إنهاء الزيارة
                    </button>
                  )}
                  {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(appt)}>
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {completeTarget && (
        <CompleteVisitModal
          appointment={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onDone={() => {
            setCompleteTarget(null);
            setMessage("تم حفظ الزيارة وإنهاؤها بنجاح ✅");
            fetchAppointments();
            fetchStats();
          }}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="إلغاء الموعد"
          message={`هل أنت متأكد من إلغاء موعد ${cancelTarget.patient.fullName}؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="نعم، ألغِ الموعد"
          danger
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

export default DoctorAppointments;
