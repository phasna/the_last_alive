import { PlayerAvatar } from "./PlayerAvatar";

export function SurvivorsList({ players, selfId, compact = false }) {
  const sorted = [...players].sort(
    (a, b) => (a.eliminated ? 1 : 0) - (b.eliminated ? 1 : 0)
  );

  return (
    <div
      className={`panel flex flex-col min-w-0 ${
        compact ? "p-2 w-44" : "p-3 w-52"
      }`}
    >
      <p className="text-[9px] tracking-[0.35em] text-[#5a6a5a] mb-2 shrink-0">
        OPÉRATEURS
      </p>
      <ul className="space-y-1.5 overflow-y-auto max-h-[280px] pr-1">
        {sorted.map((p) => {
          const isSelf = p.id === selfId;
          const dead = p.eliminated || p.lives <= 0;

          return (
            <li
              key={p.id}
              className={`flex items-center gap-2 px-2 py-1.5 border-l-2 text-xs transition-colors ${
                dead
                  ? "border-[#ff2a2a] bg-[rgba(255,42,42,0.12)] text-[#ff2a2a] opacity-90"
                  : isSelf
                    ? "border-[#39ff14] bg-[rgba(57,255,20,0.06)] text-[#39ff14]"
                    : "border-[#1a2a1a] text-[#c8e6c8]"
              }`}
            >
              <PlayerAvatar
                avatarId={p.avatar}
                size="xs"
                eliminated={dead}
                highlight={isSelf && !dead}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[10px]">
                  {p.username}
                  {isSelf && (
                    <span className="text-[8px] ml-1 opacity-70">(toi)</span>
                  )}
                </p>
                <p
                  className={`text-[8px] tracking-widest ${
                    dead ? "text-[#ff2a2a]" : "text-[#5a6a5a]"
                  }`}
                >
                  {dead ? "ÉLIMINÉ" : `${p.lives} ❤ · ${p.points ?? 0} pts`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
