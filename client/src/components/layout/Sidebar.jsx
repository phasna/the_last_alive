const NAV = [
  { id: "mission", label: "MISSION LOG" },
  { id: "survivors", label: "SURVIVORS" },
  { id: "settings", label: "SETTINGS" },
];

export function Sidebar({ username, level = 12, rank = 1200, activeNav = "survivors" }) {
  return (
    <aside className="w-56 shrink-0 border-r border-[#1a2a1a] bg-[#08080a] flex flex-col h-full">
      <div className="p-4 border-b border-[#1a2a1a]">
        <div className="w-16 h-16 border border-[#39ff14] bg-[#0f1a0f] flex items-center justify-center text-2xl mb-2">
          ☠
        </div>
        <p className="font-display text-sm neon-text truncate">{username}</p>
        <p className="text-[10px] text-[#5a6a5a] mt-1">
          LVL {level} · RANK {rank.toLocaleString()}
        </p>
      </div>
      <nav className="flex-1 p-2">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`w-full text-left px-3 py-2.5 text-[11px] tracking-widest mb-1 border-l-2 transition-colors ${
              activeNav === item.id
                ? "border-[#39ff14] text-[#39ff14] bg-[rgba(57,255,20,0.06)]"
                : "border-transparent text-[#5a6a5a] hover:text-[#c8e6c8]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 text-[9px] text-[#3a4a3a] tracking-wider">
        SYS v1.0 · NODE ARENA
      </div>
    </aside>
  );
}
