import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function OAuthCallback() {
  const navigate = useNavigate(); const { setUser } = useContext(AuthContext); const [error, setError] = useState("");
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) { setError("تعذر إتمام تسجيل الدخول"); return; }
    localStorage.setItem("token", token);
    api.get("/users/profile").then(r => { setUser(r.data); navigate("/", { replace: true }); }).catch(() => { localStorage.removeItem("token"); setError("تعذر تحميل الحساب"); });
  }, [navigate, setUser]);
  return <div className="page"><div className="card form-card center"><h1>{error ? "تعذر تسجيل الدخول" : "جاري تسجيل الدخول..."}</h1>{error && <p className="alert alert-error">{error}</p>}</div></div>;
}
