import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function PatientProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/patients/${id}/profile`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "تعذر تحميل ملف المريض");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="page center">
        <p className="muted">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="alert alert-error">{error || "تعذر عرض هذا الملف"}</div>
      </div>
    );
  }

  const { statistics, history } = data;

  return (
    <div className="page">
      <div className="page-head">
        <h1>ملف المريض</h1>
        <p className="subtitle">{data.patient.email}</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        <div className="card center">
          <div style={{ fontSize: 28, fontFamily: "var(--display)", fontWeight: 700, color: "var(--teal-800)" }}>
            {statistics.totalAppointments}
          </div>
          <div className="muted" style={{ fontSize: 13.5 }}>إجمالي المواعيد</div>
        </div>
        <div className="card center">
          <div style={{ fontSize: 28, fontFamily: "var(--display)", fontWeight: 700, color: "var(--green-600)" }}>
            {statistics.completed}
          </div>
          <div className="muted" style={{ fontSize: 13.5 }}>زيارات مكتملة</div>
        </div>
        <div className="card center">
          <div style={{ fontSize: 28, fontFamily: "var(--display)", fontWeight: 700, color: "var(--teal-700)" }}>
            {statistics.medicalRecords}
          </div>
          <div className="muted" style={{ fontSize: 13.5 }}>سجلات طبية</div>
        </div>
      </div>

      <div className="section">
        <h2>التاريخ الطبي</h2>
        {history.length === 0 ? (
          <div className="empty-state">لا يوجد تاريخ طبي مسجل لهذا المريض بعد.</div>
        ) : (
          <div className="stack">
            {history.map((record) => (
              <div key={record.id} className="card">
                <div className="row between wrap" style={{ marginBottom: 8 }}>
                  <h3 style={{ marginBottom: 0 }}>{record.diagnosis}</h3>
                  <span className="muted" style={{ fontSize: 13.5 }}>
                    {new Date(record.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {record.notes && <p style={{ marginBottom: 6 }}>{record.notes}</p>}
                {record.doctor && (
                  <span className="muted" style={{ fontSize: 13 }}>بواسطة د. {record.doctor.fullName}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientProfile;
