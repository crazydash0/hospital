import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const ROLE_LABELS = {
  PATIENT: "مريض",
  DOCTOR: "دكتور",
  ADMIN: "أدمن",
};

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  const patientLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/book", label: "احجز موعد" },
    { to: "/my-appointments", label: "مواعيدي" },
    { to: "/my-records", label: "سجلي الطبي" },
  ];

  const doctorLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/doctor-appointments", label: "مواعيدي" },
    { to: "/weekly-schedule", label: "الجدول الأسبوعي" },
    { to: "/create-slots", label: "إضافة مواعيد" },
  ];

  const adminLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/admin", label: "لوحة التحكم" },
  ];

  const links = !user
    ? []
    : user.role === "DOCTOR"
    ? doctorLinks
    : user.role === "ADMIN"
    ? adminLinks
    : patientLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="dot" />
          عيادتي
        </NavLink>

        {user && (
          <div className="navbar-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {!user && <div style={{ flex: 1 }} />}

        {user ? (
          <div className="navbar-user">
            <span className="role-tag">{ROLE_LABELS[user.role] || user.role}</span>
            <span className="name">{user.fullName || user.email}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              تسجيل خروج
            </button>
          </div>
        ) : (
          <div className="row">
            <NavLink to="/login" className="btn btn-outline btn-sm">
              تسجيل دخول
            </NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">
              حساب جديد
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
