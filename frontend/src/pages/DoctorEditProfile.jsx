import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Avatar from "../components/Avatar";

function DoctorEditProfile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [price, setPrice] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await api.get("/doctors/me/profile");
      setProfile(response.data);
      setBio(response.data.bio || "");
      setSpecialty(response.data.specialty || "");
      setPrice(String(response.data.price ?? ""));
      setFacebookUrl(response.data.facebookUrl || "");
      setInstagramUrl(response.data.instagramUrl || "");
      setWhatsappUrl(response.data.whatsappUrl || "");
      setLinkedinUrl(response.data.linkedinUrl || "");
      setWebsiteUrl(response.data.websiteUrl || "");
    } catch (err) {
      setError(err.response?.data?.message || "تعذر تحميل بياناتك");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (bio.trim().length > 0 && bio.trim().length < 10) {
      setError("النبذة لازم تكون 10 أحرف على الأقل");
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch("/doctors/me/profile", {
        bio: bio.trim() || undefined,
        specialty: specialty.trim() || undefined,
        price: price ? Number(price) : undefined,
        facebookUrl: facebookUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        whatsappUrl: whatsappUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      setProfile(response.data);
      setSuccess("تم حفظ بياناتك بنجاح ✅");
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setUploadingPhoto(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/doctors/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(response.data);
      setSuccess("تم تحديث الصورة الشخصية ✅");
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ أثناء رفع الصورة");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="page center">
        <p className="muted">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>بروفايلي</h1>
        <p className="subtitle">حدّث صورتك ونبذتك عشان المرضى يتعرفوا عليك أكتر قبل الحجز.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="row" style={{ marginBottom: 24, gap: 18 }}>
          <Avatar src={profile?.photoUrl} name={profile?.fullName} size={84} />
          <div>
            <h3 style={{ marginBottom: 6 }}>{profile?.fullName}</h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "جاري الرفع..." : "تغيير الصورة"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
              JPEG أو PNG أو WEBP، بحد أقصى 5 ميجا
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="field">
            <label>نبذة عنك</label>
            <textarea
              placeholder="اكتب نبذة عن خبرتك ومجال تخصصك عشان يشوفها المرضى..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>التخصص</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <div className="field">
              <label>سعر الكشف (جنيه)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 620, marginTop: 20 }}>
        <h3 style={{ marginBottom: 4 }}>وسائل التواصل الاجتماعي</h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
          اختياري — لو ضفتها هتظهر للمرضى في بروفايلك العام.
        </p>
        <form onSubmit={handleSave}>
          <div className="field">
            <label>فيسبوك</label>
            <input
              type="text"
              placeholder="https://facebook.com/..."
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label>انستجرام</label>
            <input
              type="text"
              placeholder="https://instagram.com/..."
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label>واتساب</label>
            <input
              type="text"
              placeholder="https://wa.me/201012345678"
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label>لينكدإن</label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label>موقعك الشخصي</label>
            <input
              type="text"
              placeholder="https://..."
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ روابط التواصل"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorEditProfile;
