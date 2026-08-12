import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      setUser(response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card form-card">
        <div className="page-head center">
          <h1>تسجيل الدخول</h1>
          <p className="subtitle">اهلاً بيك تاني، ادخل بياناتك عشان تكمل</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="center muted" style={{ marginTop: 16 }}>
          مالكش حساب؟ <Link to="/register">اعمل حساب جديد</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
