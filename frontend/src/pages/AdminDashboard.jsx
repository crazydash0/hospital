import { useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    specialty: "",
    price: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/admin/doctor", {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        specialty: form.specialty,
        price: Number(form.price),
        bio: form.bio || undefined,
      });
      setSuccess(`تم إنشاء حساب الدكتور "${form.fullName}" بنجاح. ابعت له بيانات الدخول عشان يكمّل بروفايله.`);
      setForm({ email: "", password: "", fullName: "", specialty: "", price: "", bio: "" });
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء إنشاء حساب الدكتور");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>لوحة تحكم الأدمن</h1>
        <p className="subtitle">أضف حسابات الدكاترة اللي هيشتغلوا في العيادة.</p>
      </div>

      <div className="card form-card wide">
        <h2>إضافة دكتور جديد</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>اسم الدكتور *</label>
              <input
                type="text"
                placeholder="أحمد محمد"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>التخصص *</label>
              <input
                type="text"
                placeholder="باطنة، جراحة، أسنان..."
                value={form.specialty}
                onChange={(e) => update("specialty", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>البريد الإلكتروني *</label>
              <input
                type="email"
                placeholder="doctor@clinic.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>كلمة مرور مؤقتة *</label>
              <input
                type="text"
                placeholder="6 أحرف على الأقل"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>سعر الكشف (جنيه) *</label>
            <input
              type="number"
              placeholder="300"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              min="0"
              required
            />
          </div>

          <div className="field">
            <label>نبذة عن الدكتور (اختياري الآن)</label>
            <textarea
              placeholder="الدكتور يقدر يضيف أو يعدّل النبذة والصورة بنفسه بعد أول تسجيل دخول من صفحة (بروفايلي)"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "جاري الإنشاء..." : "إنشاء حساب الدكتور"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
