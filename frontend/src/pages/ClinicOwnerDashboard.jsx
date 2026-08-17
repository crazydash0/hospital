import { useEffect, useState } from "react";
import api from "../api/axios";
import Avatar from "../components/Avatar";

function Stat({ label, value, hint }) {
  return <div className="card"><div className="muted">{label}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{value}</div>{hint && <div className="muted" style={{ marginTop: 4 }}>{hint}</div>}</div>;
}

export default function ClinicOwnerDashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api.get("/clinic-owner/summary").then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || "تعذر تحميل لوحة العيادة")); }, []);
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="page center"><p className="muted">جاري تحميل لوحة العيادة...</p></div>;
  return <div className="page"><div className="page-head"><h1>{data.clinic.name}</h1><p className="subtitle">نظرة سريعة على أداء العيادة والمواعيد والدكاترة.</p></div><div className="grid-4"><Stat label="دكاترة" value={data.doctors.length}/><Stat label="مرضى" value={data.patients}/><Stat label="مواعيد اليوم" value={data.todayAppointments}/><Stat label="إيرادات مسجلة" value={`${Number(data.revenue || 0).toLocaleString("ar-EG")} ${data.clinic.currency || "ج.م"}`}/></div><div className="section" style={{ marginTop: 24 }}><div className="page-head"><h2>الدكاترة</h2><p className="subtitle">الدكاترة المسجلون في عيادتك.</p></div><div className="grid-3">{data.doctors.map(d => <div className="card" key={d.id}><div className="row"><Avatar src={d.photoUrl} name={d.fullName}/><div><h3 style={{ marginBottom: 2 }}>{d.fullName}</h3><div className="muted">{d.specialty}</div><div className="muted">{Number(d.price).toLocaleString("ar-EG")} ج.م</div></div></div></div>)}</div></div></div>;
}
