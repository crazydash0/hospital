function Avatar({ src, name, size = 46 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "صورة"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--border)",
        }}
      />
    );
  }

  return (
    <div
      className="doctor-avatar"
      style={{ width: size, height: size, fontSize: size * 0.37 }}
    >
      {(name || "؟")[0]}
    </div>
  );
}

export default Avatar;
