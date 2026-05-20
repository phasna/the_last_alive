import { HeartDisplay } from "../ui/HeartDisplay";

export function TopBar({
  title = "LAST ONE ALIVE",
  timer,
  survivors,
  lives,
  points,
  subtitle,
}) {
  return (
    <header className="shrink-0 bg-[rgba(8,8,10,0.95)] backdrop-blur-sm">
      <div className="topbar-accent" />
      <div className="h-14 flex items-center justify-between px-6">
        <div>
          <h1 className="font-display text-base sm:text-lg tracking-[0.2em] neon-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-[#5a6a5a] tracking-widest mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {survivors !== undefined && (
            <div className="text-right">
              <p className="text-[9px] text-[#5a6a5a] tracking-widest">SURVIVORS</p>
              <p className="neon-text font-display text-xl tabular-nums leading-none">
                {survivors}
              </p>
            </div>
          )}
          {points !== undefined && (
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-[#5a6a5a] tracking-widest">SCORE</p>
              <p className="text-[#ffaa00] font-display text-lg tabular-nums leading-none">
                {points}
              </p>
            </div>
          )}
          {lives !== undefined && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] text-[#5a6a5a] tracking-widest">LIVES</span>
              <HeartDisplay lives={lives} size="md" />
            </div>
          )}
          {timer !== undefined && (
            <div className="min-w-[5ch] text-right border-l border-[#1a2a1a] pl-4">
              <p className="text-[9px] text-[#5a6a5a] tracking-widest mb-0.5">TIMER</p>
              <span className="font-display text-2xl neon-text tabular-nums">{timer}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
