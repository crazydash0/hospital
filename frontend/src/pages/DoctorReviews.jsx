import { useState, useEffect } from "react";
import api from "../api/axios";
import Stars from "../components/Stars";

function ReplyBox({ review, onReplied }) {
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (reply.trim().length < 2) {
      setError("الرد قصير جدًا");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/reviews/${review.id}/reply`, { reply });
      onReplied();
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء إرسال الرد");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        رد على التقييم
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      {error && <div className="alert alert-error">{error}</div>}
      <textarea
        placeholder="اكتب ردك على المريض..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={3}
      />
      <div className="row" style={{ marginTop: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? "جاري الإرسال..." : "إرسال الرد"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
          إلغاء
        </button>
      </div>
    </form>
  );
}

function DoctorReviews() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReviews() {
    setError("");
    try {
      const profileRes = await api.get("/doctors/me/profile");
      const reviewsRes = await api.get(`/reviews/doctor/${profileRes.data.id}?limit=50`);
      setData(reviewsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "تعذر تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="page center">
        <p className="muted">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const stats = data.statistics;
  const breakdown = [
    { label: "5 نجوم", value: stats.fiveStars },
    { label: "4 نجوم", value: stats.fourStars },
    { label: "3 نجوم", value: stats.threeStars },
    { label: "نجمتين", value: stats.twoStars },
    { label: "نجمة واحدة", value: stats.oneStar },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>التقييمات</h1>
        <p className="subtitle">كل تقييمات المرضى ليك، وتقدر ترد على أي تقييم عشان يشوفه الكل.</p>
      </div>

      {stats.totalReviews === 0 ? (
        <div className="empty-state">لسه مفيش تقييمات وصلتلك.</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="row wrap" style={{ gap: 30, alignItems: "center" }}>
              <div className="center">
                <div style={{ fontSize: 42, fontFamily: "var(--display)", fontWeight: 700, color: "var(--teal-800)" }}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <Stars value={stats.averageRating} size={20} />
                <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
                  من {stats.totalReviews} تقييم
                </div>
              </div>
              <div className="stack" style={{ flex: 1, minWidth: 200, gap: 6 }}>
                {breakdown.map((b) => (
                  <div key={b.label} className="row" style={{ gap: 8 }}>
                    <span className="muted" style={{ fontSize: 13, width: 70 }}>{b.label}</span>
                    <div style={{ flex: 1, height: 8, background: "var(--teal-50)", borderRadius: 999 }}>
                      <div
                        style={{
                          width: `${stats.totalReviews ? (b.value / stats.totalReviews) * 100 : 0}%`,
                          height: "100%",
                          background: "var(--amber-600)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <span className="muted" style={{ fontSize: 13 }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="stack">
            {data.reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="row between wrap" style={{ marginBottom: 6 }}>
                  <strong>{review.patient.fullName || review.patient.name}</strong>
                  <Stars value={review.rating} />
                </div>
                <p style={{ marginBottom: 8 }}>{review.comment}</p>

                {review.doctorReply ? (
                  <div
                    style={{
                      background: "var(--teal-50)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                    }}
                  >
                    <strong style={{ fontSize: 13.5, color: "var(--teal-800)" }}>ردك:</strong>
                    <p style={{ fontSize: 14, marginTop: 4 }}>{review.doctorReply}</p>
                  </div>
                ) : (
                  <ReplyBox review={review} onReplied={fetchReviews} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorReviews;
