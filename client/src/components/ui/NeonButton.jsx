export function NeonButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variants = {
    primary: "neon-btn",
    secondary:
      "border border-[#1a2a1a] bg-transparent text-[#c8e6c8] hover:border-[#39ff14] hover:text-[#39ff14] hover:bg-[rgba(57,255,20,0.06)] hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]",
    danger:
      "border-2 border-[#ff2a2a] text-[#ff2a2a] bg-[rgba(255,42,42,0.08)] hover:bg-[rgba(255,42,42,0.18)] hover:shadow-[0_0_25px_rgba(255,42,42,0.35)]",
  };

  return (
    <button
      type="button"
      className={`px-6 py-3 font-display text-xs tracking-widest transition-all duration-200 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
