import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  function finish(data) {
    if (!data?.access_token || !data?.user) {
      throw new Error("Invalid authentication response");
    }

    localStorage.setItem("token", data.access_token);
    setUser(data.user);
    navigate("/", { replace: true });
  }

  async function emailLogin(e) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResendMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      finish(response.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "بيانات الدخول غير صحيحة أو الحساب غير موثق";

      setError(message);

      const normalizedMessage = String(message).toLowerCase();
      if (
        normalizedMessage.includes("verify") ||
        normalizedMessage.includes("verified") ||
        normalizedMessage.includes("مؤكد") ||
        normalizedMessage.includes("موثق") ||
        normalizedMessage.includes("تفعيل")
      ) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setError("اكتب البريد الإلكتروني أولًا لإعادة إرسال كود التفعيل");
      return;
    }

    setError("");
    setResendMessage("");
    setLoading(true);

    try {
      await api.post("/auth/resend-email-verification", { email });
      setResendMessage(
        "لو الحساب موجود ومش مفعّل، هيوصله كود تفعيل جديد على الإيميل."
      );
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || "حصل خطأ أثناء إعادة إرسال كود التفعيل"
      );
    } finally {
      setLoading(false);
    }
  }

  async function phoneLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!sent) {
        await api.post("/auth/phone/request-code", { phone });
        setSent(true);
        return;
      }

      const response = await api.post("/auth/phone/verify-code", {
        phone,
        code,
      });
      finish(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "تعذر التحقق من رقم الهاتف"
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSent(false);
    setCode("");
    setNeedsVerification(false);
    setResendMessage("");
  }

  function changePhone() {
    setSent(false);
    setCode("");
    setError("");
  }

  return (
    <div className="page">
      <div className="card form-card">
        <div className="page-head center">
          <h1>تسجيل الدخول</h1>
          <p className="subtitle">اختار طريقة موثقة للدخول لحسابك</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {resendMessage && (
          <div className="alert alert-info">{resendMessage}</div>
        )}

        {needsVerification && (
          <button
            type="button"
            className="btn btn-outline btn-block"
            style={{ marginBottom: 16 }}
            onClick={handleResendVerification}
            disabled={loading}
          >
            {loading ? "جاري الإرسال..." : "إعادة إرسال كود تفعيل الإيميل"}
          </button>
        )}

        <div className="form-grid" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={
              mode === "email" ? "btn btn-primary" : "btn btn-secondary"
            }
            onClick={() => changeMode("email")}
          >
            البريد الإلكتروني
          </button>
          <button
            type="button"
            className={
              mode === "phone" ? "btn btn-primary" : "btn btn-secondary"
            }
            onClick={() => changeMode("phone")}
          >
            رقم الموبايل
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={emailLogin}>
            <div className="field">
              <label htmlFor="login-email">البريد الإلكتروني</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">كلمة المرور</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <p className="muted" style={{ marginTop: -4 }}>
              لازم يكون البريد الإلكتروني مؤكد قبل تسجيل الدخول.
            </p>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "جاري الدخول..." : "دخول بالبريد"}
            </button>
          </form>
        ) : (
          <form onSubmit={phoneLogin}>
            <div className="field">
              <label htmlFor="login-phone">رقم الموبايل</label>
              <input
                id="login-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+201012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={sent}
                required
              />
            </div>

            {sent && (
              <div className="field">
                <label htmlFor="login-phone-code">كود التحقق المرسل SMS</label>
                <input
                  id="login-phone-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || (sent && code.length !== 6)}
            >
              {loading
                ? "جاري المعالجة..."
                : sent
                  ? "تأكيد الكود"
                  : "إرسال كود SMS"}
            </button>

            {sent && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ marginTop: 10 }}
                onClick={changePhone}
                disabled={loading}
              >
                تغيير الرقم
              </button>
            )}
          </form>
        )}

        <div className="center muted" style={{ margin: "20px 0 10px" }}>
          أو باستخدام حساب موثوق
        </div>

        <div className="form-grid">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              window.location.assign(`${apiBase}/auth/google`)
            }
            disabled={loading}
          >
            متابعة بـ Google
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              window.location.assign(`${apiBase}/auth/facebook`)
            }
            disabled={loading}
          >
            متابعة بـ Facebook
          </button>
        </div>

        <p className="center muted" style={{ marginTop: 16 }}>
          Google/Facebook لازم يكون الحساب موثوقًا، والبريد الإلكتروني الموثق هو
          الأفضل. <Link to="/register">إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
