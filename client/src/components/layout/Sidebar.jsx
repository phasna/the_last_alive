const NAV = [
  { id: "mission", label: "MISSION LOG", icon: "▸" },
  { id: "survivors", label: "SURVIVORS", icon: "◉" },
  { id: "settings", label: "SETTINGS", icon: "⚙" },
];

export function Sidebar({ username, level = 12, rank = 1200, activeNav = "survivors" }) {
  return (
    <aside className="w-56 shrink-0 border-r border-[#1a2a1a] bg-[rgba(8,8,10,0.95)] flex flex-col h-full backdrop-blur-sm">
      <div className="p-4 border-b border-[#1a2a1a]">
        <div className="relative w-16 h-16 border border-[#39ff14] bg-[#0a140a] flex items-center justify-center text-2xl mb-3 neon-box">
          <span className="relative z-10">☠</span>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#39ff14] border border-[#050506]" title="En ligne" />
        </div>
        <p className="font-display text-sm neon-text truncate">{username}</p>
        <p className="text-[10px] text-[#5a6a5a] mt-1 tracking-wider">
          LVL {level} · RANK {rank.toLocaleString()}
        </p>
      </div>
      <nav className="flex-1 p-3">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`w-full text-left px-3 py-3 text-[11px] tracking-widest mb-1 border-l-2 transition-all duration-200 flex items-center gap-2 ${
              activeNav === item.id
                ? "border-[#39ff14] text-[#39ff14] bg-[rgba(57,255,20,0.08)] shadow-[inset_0_0_20px_rgba(57,255,20,0.05)]"
                : "border-transparent text-[#5a6a5a] hover:text-[#c8e6c8] hover:bg-[rgba(255,255,255,0.02)]"
            }`}
          >
            <span className="opacity-60 text-[10px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-[#1a2a1a]">
        <div className="progress-bar mb-2">
          <div className="progress-bar__fill w-[45%]" />
        </div>
        <p className="text-[9px] text-[#3a4a3a] tracking-wider">SYS v1.0 · NODE ARENA</p>
      </div>
    </aside>
  );
}
