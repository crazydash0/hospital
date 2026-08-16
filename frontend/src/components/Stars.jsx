function Stars({ value, size = 15 }) {
  const rounded = Math.round(value || 0);
  return (
    <span className="star-rating" style={{ cursor: "default", fontSize: size, gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "filled" : ""}>★</span>
      ))}
    </span>
  );
}

export default Stars;
