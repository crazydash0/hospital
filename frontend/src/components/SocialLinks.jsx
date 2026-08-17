const PLATFORMS = [
  { key: "facebookUrl", label: "فيسبوك", icon: "📘" },
  { key: "instagramUrl", label: "انستجرام", icon: "📷" },
  { key: "whatsappUrl", label: "واتساب", icon: "💬" },
  { key: "linkedinUrl", label: "لينكدإن", icon: "💼" },
  { key: "websiteUrl", label: "الموقع الشخصي", icon: "🌐" },
];

function normalizeUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function SocialLinks({ doctor }) {
  const links = PLATFORMS.filter((p) => doctor[p.key]);
  if (links.length === 0) return null;

  return (
    <div className="row wrap" style={{ gap: 8, marginTop: 4 }}>
      {links.map((p) => (
        <a
          key={p.key}
          href={normalizeUrl(doctor[p.key])}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          {p.icon} {p.label}
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
