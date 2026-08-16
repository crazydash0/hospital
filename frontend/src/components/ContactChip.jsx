function ContactChip({ email, phone }) {
  if (!email && !phone) return null;

  return (
    <div className="row wrap" style={{ gap: 8, marginTop: 6 }}>
      {email && (
        <a
          href={`mailto:${email}`}
          className="btn btn-outline btn-sm"
          style={{ fontWeight: 600 }}
          onClick={(e) => e.stopPropagation()}
        >
          ✉️ {email}
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="btn btn-outline btn-sm"
          style={{ fontWeight: 600 }}
          onClick={(e) => e.stopPropagation()}
        >
          📞 {phone}
        </a>
      )}
    </div>
  );
}

export default ContactChip;
