import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

function Stars({ value }) {
  const rounded = Math.round(value || 0);
  return (
    <span className="star-rating" style={{ cursor: "default", fontSize: 18 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "filled" : ""}>★</span>
      ))}
    </span>
  );
}

function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [doctorRes, reviewsRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/reviews/doctor/${id}`),
        ]);
        setDoctor(doctorRes.data);
        setReviewsData(reviewsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "تعذر تحميل بيانات الدكتور");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="page center">
        <p className="muted">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="page">
        <div className="alert alert-error">{error || "الدكتور غير موجود"}</div>
      </div>
    );
  }

  const stats = reviewsData?.statistics;

  return (
    <div className="page">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row wrap" style={{ alignItems: "flex-start", gap: 18 }}>
          <div className="doctor-avatar" style={{ width: 66, height: 66, fontSize: 26 }}>
            {(doctor.fullName || "د")[0]}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ marginBottom: 4 }}>د. {doctor.fullName}</h1>
            <p className="muted" style={{ marginBottom: 8 }}>{doctor.specialty}</p>
            {stats && stats.totalReviews > 0 && (
              <div className="row" style={{ marginBottom: 8 }}>
                <Stars value={stats.averageRating} />
                <span className="muted" style={{ fontSize: 14 }}>
                  {stats.averageRating.toFixed(1)} ({stats.totalReviews} تقييم)
                </span>
              </div>
            )}
            {doctor.bio && <p style={{ marginBottom: 10 }}>{doctor.bio}</p>}
            <strong style={{ color: "var(--teal-800)", fontSize: 18 }}>{doctor.price} ج.م</strong>
          </div>
          <Link to="/book" className="btn btn-primary">احجز موعد</Link>
        </div>
      </div>

      <div className="section">
        <h2>تقييمات المرضى</h2>
        {!stats || stats.totalReviews === 0 ? (
          <div className="empty-state">لسه مفيش تقييمات لهذا الدكتور.</div>
        ) : (
          <div className="stack">
            {reviewsData.reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="row between wrap" style={{ marginBottom: 6 }}>
                  <strong>{review.patient.fullName || review.patient.name}</strong>
                  <Stars value={review.rating} />
                </div>
                <p style={{ marginBottom: review.doctorReply ? 10 : 0 }}>{review.comment}</p>
                {review.doctorReply && (
                  <div
                    style={{
                      background: "var(--teal-50)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 12px",
                      marginTop: 8,
                    }}
                  >
                    <strong style={{ fontSize: 13.5, color: "var(--teal-800)" }}>
                      رد الدكتور:
                    </strong>
                    <p style={{ fontSize: 14, marginTop: 4 }}>{review.doctorReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorProfile;
