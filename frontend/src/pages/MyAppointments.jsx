import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ContactChip from "../components/ContactChip";

function ReviewModal({ appointment, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (comment.trim().length < 10) {
      setError("التعليق لازم يكون 10 أحرف على الأقل");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        appointmentId: appointment.id,
        rating,
        comment,
        isAnonymous,
      });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>قيّم زيارتك مع د. {appointment.doctor.fullName}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>التقييم</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={n <= rating ? "filled" : ""}
                  onClick={() => setRating(n)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="field">
            <label>تعليقك</label>
            <textarea
              placeholder="اكتب رأيك في الدكتور والزيارة..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: "auto" }}
            />
            <label htmlFor="anon" style={{ marginBottom: 0 }}>إرسال التقييم بدون اسمي</label>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
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

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  async function fetchAppointments() {
    try {
      const response = await api.get("/appointments/patient");
      setAppointments(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel() {
    setError("");
    try {
      await api.patch(`/appointments/${cancelTarget.id}/cancel`);
      setCancelTarget(null);
      setMessage("تم إلغاء الموعد.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء الإلغاء");
      setCancelTarget(null);
    }
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(b.slot.startTime) - new Date(a.slot.startTime)
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1>مواعيدي</h1>
        <p className="subtitle">تابع كل مواعيدك الحالية والسابقة من هنا.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {sorted.length === 0 ? (
        <div className="empty-state">مفيش مواعيد محجوزة لسه.</div>
      ) : (
        <div className="stack">
          {sorted.map((appt) => (
            <div key={appt.id} className="card">
              <div className="row between wrap">
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <div className="doctor-avatar">{(appt.doctor.fullName || "د")[0]}</div>
                  <div>
                    <h3 style={{ marginBottom: 2 }}>
                      <Link to={`/doctors/${appt.doctor.id}`}>د. {appt.doctor.fullName}</Link>
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
                    <ContactChip email={appt.doctor.user?.email} />
                  </div>
                </div>
                <div className="row wrap">
                  <StatusBadge status={appt.status} />
                  {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(appt)}>
                      إلغاء
                    </button>
                  )}
                  {appt.status === "COMPLETED" && (
                    <button className="btn btn-accent btn-sm" onClick={() => setReviewTarget(appt)}>
                      قيّم الزيارة
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          appointment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewTarget(null);
            setMessage("شكرًا لتقييمك ✨");
          }}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="إلغاء الموعد"
          message={`هل أنت متأكد من إلغاء موعدك مع د. ${cancelTarget.doctor.fullName}؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="نعم، ألغِ الموعد"
          danger
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

export default MyAppointments;
