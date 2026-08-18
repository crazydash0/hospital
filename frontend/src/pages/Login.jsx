import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [mode, setMode] = useState("email"); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [phone, setPhone] = useState(""); const [code, setCode] = useState(""); const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext); const navigate = useNavigate(); const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
  function finish(data) { localStorage.setItem("token", data.access_token); setUser(data.user); navigate("/"); }
  async function emailLogin(e) { e.preventDefault(); setError(""); setLoading(true); try { finish((await api.post("/auth/login", { email, password })).data); } catch (err) { setError(err.response?.data?.message || "بيانات الدخول غير صحيحة"); } finally { setLoading(false); } }
  async function phoneLogin(e) { e.preventDefault(); setError(""); setLoading(true); try { if (!sent) { await api.post("/auth/phone/request-code", { phone }); setSent(true); } else finish((await api.post("/auth/phone/verify-code", { phone, code })).data); } catch (err) { setError(err.response?.data?.message || "تعذر التحقق من رقم الهاتف"); } finally { setLoading(false); } }
  return <div className="page"><div className="card form-card"><div className="page-head center"><h1>تسجيل الدخول</h1><p className="subtitle">اختار طريقة الدخول المناسبة ليك</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="form-grid" style={{ marginBottom: 16 }}><button type="button" className={mode === "email" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => { setMode("email"); setError(""); }}>البريد الإلكتروني</button><button type="button" className={mode === "phone" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => { setMode("phone"); setError(""); }}>رقم الموبايل</button></div>
    {mode === "email" ? <form onSubmit={emailLogin}><div className="field"><label>البريد الإلكتروني</label><input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="field"><label>كلمة المرور</label><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div><button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري الدخول..." : "دخول"}</button></form> : <form onSubmit={phoneLogin}><div className="field"><label>رقم الموبايل</label><input type="text" placeholder="+201012345678" value={phone} onChange={e => setPhone(e.target.value)} required /></div>{sent && <div className="field"><label>كود التحقق</label><input inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} required /></div>}<button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "جاري المعالجة..." : sent ? "تأكيد الكود" : "إرسال كود التحقق"}</button></form>}
    <div className="center muted" style={{ margin: "18px 0 10px" }}>أو</div>
    <div className="form-grid"><button type="button" className="btn btn-secondary" onClick={() => window.location.assign(`${apiBase}/auth/google`)}>Google</button><button type="button" className="btn btn-secondary" onClick={() => window.location.assign(`${apiBase}/auth/facebook`)}>Facebook</button></div>
    <p className="center muted" style={{ marginTop: 16 }}>مالكش حساب؟ <Link to="/register">اعمل حساب جديد</Link></p>
  </div></div>;
}
export default Login;
