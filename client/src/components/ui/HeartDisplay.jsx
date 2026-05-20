export function HeartDisplay({ lives = 3, max = 3, size = "md" }) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className={`inline-flex gap-0.5 ${sizeClass}`} aria-label={`${lives} vies`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < lives ? "text-[#ff4d8d]" : "text-[#333] opacity-40"}
        >
          ♥
        </span>
      ))}
    </span>
  );
}
