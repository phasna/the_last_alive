export function NeonButton({ children, className = "", variant = "primary", ...props }) {
  const base =
    variant === "danger"
      ? "border-[#ff2a2a] text-[#ff2a2a] bg-[rgba(255,42,42,0.08)] hover:bg-[rgba(255,42,42,0.2)]"
      : "neon-btn";
  return (
    <button
      type="button"
      className={`px-6 py-3 font-display text-xs tracking-widest ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
