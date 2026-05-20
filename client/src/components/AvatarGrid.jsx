const AVATAR_COLORS = [
  "#39ff14", "#ff4d8d", "#4d9fff", "#ffaa00", "#b44dff", "#00ffcc",
];

function PixelAvatar({ name, index, isSelf }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`flex flex-col items-center gap-1 p-2 border ${
        isSelf ? "border-[#39ff14] bg-[rgba(57,255,20,0.08)]" : "border-[#1a2a1a] bg-[#0a0a0c]"
      }`}
    >
      <div
        className="w-12 h-12 grid grid-cols-4 grid-rows-4 gap-px"
        style={{ imageRendering: "pixelated" }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-full"
            style={{
              backgroundColor:
                (i + index) % 3 === 0 ? color : (i + index) % 5 === 0 ? "#111" : "transparent",
            }}
          />
        ))}
      </div>
      <span className="text-[9px] tracking-wider truncate max-w-[72px]">{name}</span>
      {isSelf && (
        <span className="text-[8px] text-[#39ff14]">YOU</span>
      )}
    </div>
  );
}

export function AvatarGrid({ players, selfId }) {
  const others = players.filter((p) => p.id !== selfId);
  const self = players.find((p) => p.id === selfId);

  return (
    <div className="flex gap-6 items-start">
      {self && (
        <div className="shrink-0">
          <div className="w-40 h-48 border-2 border-[#39ff14] bg-[#0f1a0f] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-50" />
            <span className="text-6xl relative z-10">☠</span>
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-center">
              <p className="font-display text-xs neon-text">{self.username}</p>
              <p className="text-[9px] text-[#5a6a5a]">
                {self.ready ? "READY" : "STANDBY"}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {others.map((p, i) => (
          <PixelAvatar
            key={p.id}
            name={p.username}
            index={i}
            isSelf={false}
          />
        ))}
        {others.length < 7 &&
          Array.from({ length: 7 - others.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-full aspect-square border border-dashed border-[#1a2a1a] opacity-30"
            />
          ))}
      </div>
    </div>
  );
}
