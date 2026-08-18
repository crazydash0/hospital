import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [fullName, setFullName] = useState(""); const [phone, setPhone] = useState("");
  const [gender, setGender] = useState(""); const [birthDate, setBirthDate] = useState(""); const [address, setAddress] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function registerEmail(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/auth/register", { email, password, fullName, phone: phone || undefined, gender: gender || undefined, birthDate: birthDate || undefined, address: address || undefined });
      navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) { setError(err.response?.data?.message || "حصل خطأ أثناء إنشاء الحساب"); }
    finally { setLoading(false); }
  }

  async function registerPhone(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/auth/phone/request-code", { phone });
      navigate(`/verify-phone?phone=${encodeURIComponent(phone)}&fullName=${encodeURIComponent(fullName)}`);
    } catch (err) { setError(err.response?.data?.message || "تعذر إرسال كود SMS"); }
    finally { setLoading(false); }
  }

  function switchMethod(next) { setMethod(next); setError(""); }

  return <div className="page"><div className="card form-card wide">
    <div className="page-head center"><h1>إنشاء حساب مريض</h1><p className="subtitle">اختار وسيلة موثقة لإنشاء حسابك</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="form-grid" style={{ marginBottom: 18 }}>
      <button type="button" className={method === "email" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => switchMethod("email")}>بريد إلكتروني</button>
      <button type="button" className={method === "phone" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => switchMethod("phone")}>رقم موبايل</button>
    </div>

    {method === "email" ? <form onSubmit={registerEmail}>
      <div className="form-grid"><div className="field"><label>الاسم بالكامل *</label><input type="text" autoComplete="name" placeholder="أحمد محمد" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="field"><label>البريد الإلكتروني *</label><input type="email" autoComplete="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>
      <div className="form-grid"><div className="field"><label>كلمة المرور *</label><input type="password" autoComplete="new-password" placeholder="12 حرف على الأقل" value={password} onChange={e => setPassword(e.target.value)} minLength={12} required /></div><div className="field"><label>رقم الهاتف (اختياري)</label><input type="tel" autoComplete="tel" placeholder="+201012345678" value={phone} onChange={e => setPhone(e.target.value)} /></div></div>
      <div className="form-grid"><div className="field"><label>النوع</label><select value={gender} onChange={e => setGender(e.target.value)}><option value="">اختر</option><option value="MALE">ذكر</option><option value="FEMALE">أنثى</option></select></div><div className="field"><label>تاريخ الميلاد</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div></div>
      <div className="field"><label>العنوان</label><input type="text" autoComplete="street-address" placeholder="القاهرة، مصر" value={address} onChange={e => setAddress(e.target.value)} /></div>
      <div className="alert alert-success" style={{ marginBottom: 14 }}>بعد التسجيل هنرسل كود تأكيد إلى البريد. مش هتقدر تدخل قبل تأكيده.</div>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري الإنشاء..." : "إنشاء الحساب وتأكيد البريد"}</button>
    </form> : <form onSubmit={registerPhone}>
      <div className="field"><label>الاسم بالكامل *</label><input type="text" autoComplete="name" placeholder="أحمد محمد" value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
      <div className="field"><label>رقم الموبايل *</label><input type="tel" autoComplete="tel" placeholder="+201012345678" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
      <div className="alert alert-success" style={{ marginBottom: 14 }}>هنرسل كود SMS للموبايل. الحساب ما يتفعلش إلا بعد إدخال الكود الصحيح.</div>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري الإرسال..." : "إرسال كود SMS"}</button>
    </form>}

    <div className="center muted" style={{ margin: "20px 0 10px" }}>أو سجل بحساب موثوق</div>
    <div className="form-grid"><button type="button" className="btn btn-secondary" onClick={() => window.location.assign(`${apiBase}/auth/google`)}>Google</button><button type="button" className="btn btn-secondary" onClick={() => window.location.assign(`${apiBase}/auth/facebook`)}>Facebook</button></div>
    <p className="center muted" style={{ marginTop: 16 }}>عندك حساب بالفعل؟ <Link to="/login">سجل دخولك</Link></p>
  </div></div>;
}
export default Register;
