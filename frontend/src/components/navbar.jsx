import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import NewAppointmentToast from "./NewAppointmentToast";
import { getLastSeenAppointmentId, setLastSeenAppointmentId } from "../utils/appointmentAlerts";

const ROLE_LABELS = {
  PATIENT: "مريض",
  DOCTOR: "دكتور",
  ADMIN: "أدمن",
};

const POLL_INTERVAL_MS = 20000;

function useNewAppointmentsAlert(user) {
  const [hasNew, setHasNew] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const notifiedIdsRef = useRef(new Set());
  const notificationAskedRef = useRef(false);
  const isFirstPollRef = useRef(true);

  useEffect(() => {
    if (!user || user.role !== "DOCTOR") return;

    // اطلب إذن إشعارات المتصفح مرة واحدة بس
    if (!notificationAskedRef.current && "Notification" in window && Notification.permission === "default") {
      notificationAskedRef.current = true;
      Notification.requestPermission();
    }

    let cancelled = false;

    async function poll() {
      try {
        const response = await api.get("/appointments/doctor");
        if (cancelled) return;

        const appointments = response.data;
        if (appointments.length === 0) return;

        const maxId = Math.max(...appointments.map((a) => a.id));
        const lastSeen = getLastSeenAppointmentId();

        // أول مرة نفحص فيها بعد إضافة الميزة دي، لا نبلّغ عن مواعيد قديمة
        // كانت موجودة أصلًا؛ بس نأسس نقطة البداية بهدوء.
        if (isFirstPollRef.current) {
          isFirstPollRef.current = false;
          appointments.forEach((a) => notifiedIdsRef.current.add(a.id));
          if (lastSeen === 0) {
            setLastSeenAppointmentId(maxId);
            return;
          }
        }

        // لو الدكتور فاتح صفحة مواعيده دلوقتي، اعتبر كل حاجة متشافة
        if (location.pathname === "/doctor-appointments") {
          setLastSeenAppointmentId(maxId);
          setHasNew(false);
          return;
        }

        const newOnes = appointments.filter(
          (a) => a.id > lastSeen && !notifiedIdsRef.current.has(a.id)
        );

        if (newOnes.length > 0) {
          newOnes.forEach((a) => notifiedIdsRef.current.add(a.id));
          setHasNew(true);
          setToast({ count: newOnes.length });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("عيادتي — حجز جديد", {
              body:
                newOnes.length > 1
                  ? `عندك ${newOnes.length} حجوزات جديدة`
                  : `${newOnes[0].patient?.fullName || "مريض"} حجز معاك موعد جديد`,
            });
          }
        } else if (maxId > lastSeen) {
          setHasNew(true);
        }
      } catch (err) {
        console.log(err);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, location.pathname]);

  function markSeen() {
    setHasNew(false);
    setToast(null);
  }

  return { hasNew, toast, dismissToast: () => setToast(null), markSeen };
}

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { hasNew, toast, dismissToast, markSeen } = useNewAppointmentsAlert(user);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  function goToAppointments() {
    dismissToast();
    markSeen();
    navigate("/doctor-appointments");
  }

  const patientLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/book", label: "احجز موعد" },
    { to: "/my-appointments", label: "مواعيدي" },
    { to: "/my-records", label: "سجلي الطبي" },
  ];

  const doctorLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/doctor-appointments", label: "مواعيدي", alert: hasNew },
    { to: "/patients", label: "مرضاي" },
    { to: "/weekly-schedule", label: "الجدول الأسبوعي" },
    { to: "/create-slots", label: "إضافة مواعيد" },
    { to: "/my-reviews", label: "التقييمات" },
    { to: "/my-profile", label: "بروفايلي" },
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
                style={{ position: "relative" }}
              >
                {link.label}
                {link.alert && (
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "var(--rose-600)",
                      border: "2px solid var(--surface)",
                    }}
                  />
                )}
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

      {toast && (
        <NewAppointmentToast
          count={toast.count}
          onDismiss={dismissToast}
          onView={goToAppointments}
        />
      )}
    </nav>
  );
}

export default Navbar;
