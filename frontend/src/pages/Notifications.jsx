import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Notifications() {
  const [items, setItems] = useState([]); const [prefs, setPrefs] = useState({ email: true, sms: true, inApp: true, reminders: true }); const [error, setError] = useState("");
  useEffect(() => { Promise.all([api.get("/notifications"), api.patch("/notifications/preferences", {})]).then(([n, p]) => { setItems(n.data); setPrefs(p.data); }).catch(() => setError("تعذر تحميل الإشعارات")); }, []);
  async function toggle(key) { const next = { ...prefs, [key]: !prefs[key] }; setPrefs(next); try { await api.patch("/notifications/preferences", { [key]: next[key] }); } catch { setPrefs(prefs); } }
  return <div className="page"><div className="page-head"><h1>الإشعارات</h1><p className="subtitle">تحكم في طريقة استلام رسائل المواعيد والتنبيهات</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="card" style={{ marginBottom: 16 }}><h3>طرق التواصل</h3><div className="form-grid"><label><input type="checkbox" checked={prefs.email} onChange={() => toggle("email")} /> البريد الإلكتروني</label><label><input type="checkbox" checked={prefs.sms} onChange={() => toggle("sms")} /> SMS</label><label><input type="checkbox" checked={prefs.inApp} onChange={() => toggle("inApp")} /> إشعارات داخل التطبيق</label><label><input type="checkbox" checked={prefs.reminders} onChange={() => toggle("reminders")} /> تذكير قبل الموعد بساعة</label></div></div>
    <div className="card"><h3>آخر الإشعارات</h3>{items.length === 0 ? <p className="muted">لا توجد إشعارات حتى الآن.</p> : items.map(n => <div key={n.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}><strong>{n.title}</strong><p style={{ margin: "4px 0" }}>{n.body}</p><small className="muted">{new Date(n.createdAt).toLocaleString("ar-EG")}</small></div>)}</div>
  </div>;
}
