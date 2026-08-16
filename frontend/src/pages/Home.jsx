import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PatientHome({ user }) {
  return (
    <>
      <div className="page-head">
        <h1>أهلاً بيك، {user.fullName || user.email} 👋</h1>
        <p className="subtitle">من هنا تقدر تحجز موعد، تتابع مواعيدك، وتشوف سجلك الطبي.</p>
      </div>
      <div className="grid grid-3">
        <Link to="/book" className="card">
          <h3>احجز موعد جديد</h3>
          <p className="muted">اختار الدكتور المناسب وواعد فاضي.</p>
        </Link>
        <Link to="/my-appointments" className="card">
          <h3>مواعيدي</h3>
          <p className="muted">تابع حالة مواعيدك وألغيها لو محتاج.</p>
        </Link>
        <Link to="/my-records" className="card">
          <h3>سجلي الطبي</h3>
          <p className="muted">شوف التشخيصات والروشتات اللي اتكتبتلك.</p>
        </Link>
      </div>
    </>
  );
}

function DoctorHome({ user }) {
  return (
    <>
      <div className="page-head">
        <h1>أهلاً د. {user.fullName || user.email} 👋</h1>
        <p className="subtitle">تابع مواعيدك، جهّز جدولك الأسبوعي، وأضف مواعيد فاضية.</p>
      </div>
      <div className="grid grid-3">
        <Link to="/doctor-appointments" className="card">
          <h3>مواعيدي</h3>
          <p className="muted">أكّد أو أكمل مواعيد المرضى.</p>
        </Link>
        <Link to="/patients" className="card">
          <h3>مرضاي</h3>
          <p className="muted">تصفح مرضاك وتاريخهم الطبي.</p>
        </Link>
        <Link to="/weekly-schedule" className="card">
          <h3>الجدول الأسبوعي</h3>
          <p className="muted">حدّد أيام وساعات شغلك الأسبوعية.</p>
        </Link>
        <Link to="/my-profile" className="card">
          <h3>بروفايلي</h3>
          <p className="muted">أضف صورتك ونبذة عنك عشان المرضى يثقوا فيك أكتر.</p>
        </Link>
      </div>
    </>
  );
}

function AdminHome({ user }) {
  return (
    <>
      <div className="page-head">
        <h1>أهلاً بيك في لوحة التحكم</h1>
        <p className="subtitle">تقدر من هنا تضيف حسابات دكاترة جداد للعيادة.</p>
      </div>
      <div className="grid grid-3">
        <Link to="/admin" className="card">
          <h3>إضافة دكتور</h3>
          <p className="muted">أنشئ حساب دكتور جديد ببياناته وتخصصه.</p>
        </Link>
      </div>
    </>
  );
}

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page">
      {user?.role === "DOCTOR" && <DoctorHome user={user} />}
      {user?.role === "ADMIN" && <AdminHome user={user} />}
      {(!user || user.role === "PATIENT") && user && <PatientHome user={user} />}
    </div>
  );
}

export default Home;
