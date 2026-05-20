import { PlayerAvatar } from "./PlayerAvatar";

const MAX_SLOTS = 16;

function SlotCard({ player, isSelf }) {
  const dead = player.eliminated || player.lives <= 0;

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 min-h-[96px] border transition-all duration-200 ${
        dead
          ? "border-[#ff2a2a] bg-[rgba(255,42,42,0.1)] opacity-80"
          : isSelf
            ? "border-[#39ff14] bg-[rgba(57,255,20,0.08)]"
            : "border-[#1a2a1a] bg-[rgba(10,10,12,0.6)] hover:border-[#2a4a2a]"
      }`}
    >
      {isSelf && !dead && (
        <span className="absolute top-1 right-1 text-[8px] text-[#39ff14] tracking-widest z-10">
          YOU
        </span>
      )}
      {dead && (
        <span className="absolute top-1 right-1 text-[8px] text-[#ff2a2a] tracking-widest z-10">
          OUT
        </span>
      )}
      <PlayerAvatar
        avatarId={player.avatar}
        size="md"
        highlight={isSelf && !dead}
        eliminated={dead}
      />
      <span
        className={`font-display text-[10px] truncate max-w-full px-1 mt-1.5 ${
          dead ? "text-[#ff2a2a] line-through decoration-[#ff2a2a]/60" : "text-[#c8e6c8]"
        }`}
      >
        {player.username}
      </span>
      <span
        className={`text-[8px] tracking-widest ${
          dead
            ? "text-[#ff2a2a]"
            : player.ready
              ? "text-[#39ff14]"
              : "text-[#ffaa00]"
        }`}
      >
        {dead ? "✕ ÉLIMINÉ" : player.ready ? "● READY" : "○ WAIT"}
      </span>
    </div>
  );
}

function EmptySlot({ index }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[96px] border border-dashed border-[#1a2a1a] bg-[rgba(5,5,6,0.5)] opacity-50">
      <div className="w-14 h-14 border border-[#1a2a1a] flex items-center justify-center text-[#2a3a2a] text-xl">
        +
      </div>
      <span className="text-[8px] text-[#3a4a3a] tracking-widest mt-2">
        SLOT {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

export function AvatarGrid({ players, selfId }) {
  const self = players.find((p) => p.id === selfId);
  const others = players.filter((p) => p.id !== selfId);
  const ordered = self ? [self, ...others] : others;
  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => ordered[i] ?? null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-fr content-start">
      {slots.map((player, i) =>
        player ? (
          <SlotCard
            key={player.id}
            player={player}
            isSelf={player.id === selfId}
          />
        ) : (
          <EmptySlot key={`empty-${i}`} index={i} />
        )
      )}
    </div>
  );
}
