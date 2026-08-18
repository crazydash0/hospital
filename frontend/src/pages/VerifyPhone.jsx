import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function VerifyPhone() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const params = new URLSearchParams(location.search);
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [fullName, setFullName] = useState(params.get("fullName") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify(e) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/phone/verify-code", { phone, code, fullName: fullName || undefined });
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) { setError(err.response?.data?.message || "الكود غير صحيح أو منتهي"); }
    finally { setLoading(false); }
  }

  async function resend() {
    setError(""); setMessage(""); setResending(true);
    try { const { data } = await api.post("/auth/phone/request-code", { phone }); setMessage(data.message || "تم إرسال كود جديد"); }
    catch (err) { setError(err.response?.data?.message || "تعذر إرسال الكود"); }
    finally { setResending(false); }
  }

  return <div className="page"><div className="card form-card">
    <div className="page-head center"><h1>تأكيد رقم الموبايل</h1><p className="subtitle">اكتب الكود المرسل لك في رسالة SMS</p></div>
    {error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}
    <form onSubmit={verify}>
      <div className="field"><label>الاسم بالكامل</label><input type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
      <div className="field"><label>رقم الموبايل</label><input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
      <div className="field"><label>كود التحقق</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} required /></div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري التحقق..." : "تأكيد الرقم وتسجيل الدخول"}</button>
    </form>
    <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={resend} disabled={resending}>{resending ? "جاري الإرسال..." : "إعادة إرسال الكود"}</button>
    <p className="center muted" style={{ marginTop: 16 }}><Link to="/register">تغيير طريقة التسجيل</Link></p>
  </div></div>;
}
