export function StatCard({ label, value, sub }) {
  return (
    <div className="panel p-4 hover:border-[#2a4a2a] transition-colors">
      <p className="text-[10px] tracking-[0.3em] text-[#5a6a5a] uppercase">{label}</p>
      <p className="font-display text-2xl neon-text mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-[#5a6a5a] mt-1">{sub}</p>}
    </div>
  );
}
