import { getAvatar } from "../data/avatars";

const SIZES = {
  xs: { box: "w-8 h-8", text: "text-base" },
  sm: { box: "w-10 h-10", text: "text-xl" },
  md: { box: "w-14 h-14", text: "text-2xl" },
  lg: { box: "w-20 h-20", text: "text-4xl" },
  xl: { box: "w-28 h-28", text: "text-5xl" },
  hero: { box: "w-36 h-36 sm:w-40 sm:h-40", text: "text-6xl sm:text-7xl" },
};

export function PlayerAvatar({
  avatarId = "skull",
  size = "md",
  highlight = false,
  eliminated = false,
  showLabel = false,
  className = "",
}) {
  const av = getAvatar(avatarId);
  const s = SIZES[size] ?? SIZES.md;

  const borderColor = eliminated
    ? "#ff2a2a"
    : highlight
      ? av.color
      : `${av.color}66`;
  const bg = eliminated ? "rgba(255,42,42,0.15)" : `${av.color}12`;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 ${
        eliminated ? "opacity-75" : ""
      } ${className}`}
    >
      <div
        className={`${s.box} flex items-center justify-center border-2 shrink-0 transition-all duration-200 ${
          eliminated
            ? "border-[#ff2a2a] bg-[rgba(255,42,42,0.12)]"
            : highlight
              ? "neon-box shadow-[0_0_25px_rgba(57,255,20,0.25)]"
              : "panel"
        }`}
        style={{
          borderColor,
          backgroundColor: bg,
          boxShadow: eliminated
            ? "0 0 12px rgba(255,42,42,0.35)"
            : highlight
              ? `0 0 30px ${av.color}33`
              : undefined,
          filter: eliminated ? "grayscale(0.6) brightness(0.85)" : undefined,
        }}
        title={eliminated ? `${av.label} — éliminé` : av.label}
      >
        <span className={s.text} role="img" aria-label={av.label}>
          {av.emoji}
        </span>
      </div>
      {showLabel && (
        <span
          className="text-[8px] tracking-widest truncate max-w-[72px]"
          style={{ color: eliminated ? "#ff2a2a" : av.color }}
        >
          {av.label}
        </span>
      )}
    </div>
  );
}
