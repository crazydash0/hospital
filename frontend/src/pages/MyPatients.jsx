import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ContactChip from "../components/ContactChip";

function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await api.get("/patients");
        setPatients(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "تعذر تحميل قائمة المرضى");
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filtered = patients.filter(
    (p) =>
      !search.trim() ||
      p.fullName?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1>مرضاي</h1>
        <p className="subtitle">كل المرضى اللي حجزوا معاك موعد، مع بيانات التواصل وتاريخهم الطبي.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <input
        type="text"
        placeholder="ابحث باسم المريض..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 280, marginBottom: 18 }}
      />

      {loading ? (
        <p className="muted">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">مفيش مرضى لسه.</div>
      ) : (
        <div className="stack">
          {filtered.map((patient) => (
            <div key={patient.id} className="card">
              <div className="row between wrap">
                <div className="row">
                  <div className="doctor-avatar">{(patient.fullName || "م")[0]}</div>
                  <div>
                    <h3 style={{ marginBottom: 2 }}>
                      <Link to={`/patients/${patient.id}`}>{patient.fullName}</Link>
                    </h3>
                    <ContactChip email={patient.user?.email} phone={patient.phone} />
                  </div>
                </div>
                <Link to={`/patients/${patient.id}`} className="btn btn-outline btn-sm">
                  عرض الملف
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPatients;
