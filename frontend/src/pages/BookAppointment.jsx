import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Avatar from "../components/Avatar";
import Stars from "../components/Stars";
import WeeklyScheduleTable from "../components/WeeklyScheduleTable";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinic, setClinic] = useState("");
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await api.get("/doctors");
        setDoctors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "تعذر تحميل الدكاترة");
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, []);

  const specialties = useMemo(() => [...new Set(doctors.map((d) => d.specialty).filter(Boolean))], [doctors]);
  const clinics = useMemo(() => [...new Map(doctors.filter((d) => d.clinic?.id).map((d) => [d.clinic.id, d.clinic])).values()], [doctors]);

  const filteredDoctors = useMemo(() => doctors.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || d.fullName?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q) || d.clinic?.name?.toLowerCase().includes(q);
    return matchesSearch && (!specialty || d.specialty === specialty) && (!clinic || String(d.clinic?.id) === clinic);
  }), [doctors, search, specialty, clinic]);

  useEffect(() => {
    if (!selectedDoctor) return;
    setLoadingSlots(true); setError(""); setMessage("");
    Promise.all([
      api.get(`/appointments/doctor/${selectedDoctor.id}/slots`),
      api.get(`/appointments/weekly-template/doctor/${selectedDoctor.id}`),
    ]).then(([slotsRes, scheduleRes]) => {
      setSlots(slotsRes.data); setSchedule(scheduleRes.data);
    }).catch((err) => setError(err.response?.data?.message || "تعذر تحميل المواعيد")).finally(() => setLoadingSlots(false));
  }, [selectedDoctor]);

  async function handleBook(slotId) {
    setMessage(""); setError("");
    try {
      await api.post("/appointments", { slotId });
      setMessage("تم حجز الموعد بنجاح ✅");
      const response = await api.get(`/appointments/doctor/${selectedDoctor.id}/slots`);
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء الحجز");
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>احجز موعد</h1>
        <p className="subtitle">ابحث في دكاترة العيادات المختلفة واختار الموعد المناسب لك.</p>
      </div>

      {loadingDoctors ? <p className="muted">جاري تحميل الدكاترة...</p> : doctors.length === 0 ? <div className="empty-state">لا يوجد دكاترة متاحين حاليًا.</div> : <>
        <div className="row wrap" style={{ marginBottom: 18, gap: 10 }}>
          <input type="text" placeholder="ابحث بالاسم أو التخصص أو العيادة..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={{ maxWidth: 200 }}><option value="">كل التخصصات</option>{specialties.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={clinic} onChange={(e) => setClinic(e.target.value)} style={{ maxWidth: 240 }}><option value="">كل العيادات</option>{clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        {filteredDoctors.length === 0 ? <div className="empty-state">مفيش دكاترة مطابقين للبحث.</div> : <div className="grid grid-3">
          {filteredDoctors.map((doctor) => <div key={doctor.id} className="card" style={{ cursor: "pointer", borderColor: selectedDoctor?.id === doctor.id ? "var(--teal-700)" : undefined, boxShadow: selectedDoctor?.id === doctor.id ? "0 0 0 2px var(--teal-100)" : undefined }} onClick={() => setSelectedDoctor(doctor)}>
            <div className="row" style={{ marginBottom: 10 }}><Avatar src={doctor.photoUrl} name={doctor.fullName} /><div><h3 style={{ marginBottom: 2 }}><Link to={`/doctors/${doctor.id}`} onClick={(e) => e.stopPropagation()}>د. {doctor.fullName}</Link></h3><span className="muted" style={{ fontSize: 13.5 }}>{doctor.specialty}</span>{doctor.clinic?.name && <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>📍 {doctor.clinic.name}</div>}{doctor.totalReviews > 0 && <div className="row" style={{ marginTop: 2, gap: 5 }}><Stars value={doctor.averageRating} /><span className="muted" style={{ fontSize: 12.5 }}>({doctor.totalReviews})</span></div>}</div></div>
            {doctor.bio && <p className="muted" style={{ fontSize: 14, marginBottom: 10 }}>{doctor.bio}</p>}
            <div className="row between"><strong style={{ color: "var(--teal-800)" }}>{doctor.price} ج.م</strong><button className="btn btn-outline btn-sm">{selectedDoctor?.id === doctor.id ? "تم الاختيار" : "اختيار"}</button></div>
          </div>)}
        </div>}
      </>}

      {selectedDoctor && <div className="section"><h2>جدول عمل د. {selectedDoctor.fullName}</h2>{selectedDoctor.clinic?.name && <p className="muted" style={{ marginBottom: 12 }}>العيادة: {selectedDoctor.clinic.name}{selectedDoctor.clinic.address ? ` — ${selectedDoctor.clinic.address}` : ""}</p>}{schedule.length > 0 && <div style={{ marginBottom: 24 }}><WeeklyScheduleTable template={schedule} /></div>}<h2>المواعيد المتاحة</h2>{message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-error">{error}</div>}{loadingSlots ? <p className="muted">جاري تحميل المواعيد...</p> : slots.length === 0 ? <div className="empty-state">مفيش مواعيد متاحة حاليًا لهذا الدكتور.</div> : <div className="stack">{slots.map((slot) => <div key={slot.id} className="card-row"><span>{new Date(slot.startTime).toLocaleString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span><button className="btn btn-primary btn-sm" onClick={() => handleBook(slot.id)}>احجز</button></div>)}</div>}</div>}
    </div>
  );
}

export default BookAppointment;
