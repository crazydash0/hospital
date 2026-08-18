import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [fullName, setFullName] = useState(""); const [phone, setPhone] = useState(""); const [gender, setGender] = useState(""); const [birthDate, setBirthDate] = useState(""); const [address, setAddress] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  async function handleRegister(e) { e.preventDefault(); setError(""); setLoading(true); try { await api.post("/auth/register", { email, password, fullName, phone: phone || undefined, gender: gender || undefined, birthDate: birthDate || undefined, address: address || undefined }); navigate(`/verify-email?email=${encodeURIComponent(email)}`); } catch (err) { setError(err.response?.data?.message || "حصل خطأ أثناء إنشاء الحساب"); } finally { setLoading(false); } }
  return <div className="page"><div className="card form-card wide"><div className="page-head center"><h1>إنشاء حساب مريض</h1><p className="subtitle">سجل بياناتك عشان تقدر تحجز مواعيدك بسهولة</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    <form onSubmit={handleRegister}>
      <div className="form-grid"><div className="field"><label>الاسم بالكامل *</label><input type="text" placeholder="أحمد محمد" value={fullName} onChange={e => setFullName(e.target.value)} required /></div><div className="field"><label>البريد الإلكتروني *</label><input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>
      <div className="form-grid"><div className="field"><label>كلمة المرور *</label><input type="password" placeholder="12 حرف على الأقل" value={password} onChange={e => setPassword(e.target.value)} minLength={12} required /></div><div className="field"><label>رقم الهاتف</label><input type="text" placeholder="+201012345678" value={phone} onChange={e => setPhone(e.target.value)} /></div></div>
      <div className="form-grid"><div className="field"><label>النوع</label><select value={gender} onChange={e => setGender(e.target.value)}><option value="">اختر</option><option value="MALE">ذكر</option><option value="FEMALE">أنثى</option></select></div><div className="field"><label>تاريخ الميلاد</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div></div>
      <div className="field"><label>العنوان</label><input type="text" placeholder="القاهرة، مصر" value={address} onChange={e => setAddress(e.target.value)} /></div>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري الإنشاء..." : "إنشاء الحساب"}</button>
    </form>
    <p className="center muted" style={{ marginTop: 16 }}>عندك حساب بالفعل؟ <Link to="/login">سجل دخولك</Link></p>
  </div></div>;
}
export default Register;
