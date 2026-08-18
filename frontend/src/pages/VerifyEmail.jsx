import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify(e) {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try { await api.post("/auth/verify-email", { email, code }); setMessage("تم تأكيد البريد الإلكتروني بنجاح"); setTimeout(() => navigate("/login"), 800); }
    catch (err) { setError(err.response?.data?.message || "الكود غير صحيح أو منتهي"); }
    finally { setLoading(false); }
  }

  async function resend() {
    setError(""); setMessage("");
    try { const r = await api.post("/auth/resend-email-verification", { email }); setMessage(r.data.message); }
    catch (err) { setError(err.response?.data?.message || "تعذر إرسال الكود"); }
  }

  return <div className="page"><div className="card form-card">
    <div className="page-head center"><h1>تأكيد البريد الإلكتروني</h1><p className="subtitle">اكتب الكود المرسل إلى بريدك</p></div>
    {error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}
    <form onSubmit={verify}>
      <div className="field"><label>البريد الإلكتروني</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div className="field"><label>كود التحقق</label><input inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} required /></div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري التحقق..." : "تأكيد"}</button>
    </form>
    <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={resend}>إعادة إرسال الكود</button>
    <p className="center muted" style={{ marginTop: 16 }}><Link to="/login">العودة لتسجيل الدخول</Link></p>
  </div></div>;
}
