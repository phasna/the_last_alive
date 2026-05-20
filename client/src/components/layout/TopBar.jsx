import { HeartDisplay } from "../ui/HeartDisplay";

export function TopBar({
  title = "LAST ONE ALIVE",
  timer,
  survivors,
  lives,
  subtitle,
}) {
  return (
    <header className="h-14 shrink-0 border-b border-[#1a2a1a] flex items-center justify-between px-6 bg-[#08080a]">
      <div>
        <h1 className="font-display text-lg tracking-[0.2em] neon-text">{title}</h1>
        {subtitle && (
          <p className="text-[10px] text-[#5a6a5a] tracking-widest">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-6">
        {survivors !== undefined && (
          <span className="text-xs tracking-widest">
            <span className="text-[#5a6a5a]">SURVIVORS </span>
            <span className="neon-text font-display text-lg">{survivors}</span>
          </span>
        )}
        {lives !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5a6a5a] tracking-widest">LIVES</span>
            <HeartDisplay lives={lives} size="md" />
          </div>
        )}
        {timer !== undefined && (
          <span className="font-display text-2xl neon-text tabular-nums min-w-[4ch]">
            {timer}
          </span>
        )}
      </div>
    </header>
  );
}
