export function StatCard({ label, value, sub }) {
  return (
    <div className="border border-[#1a2a1a] bg-[#0a0a0c] p-4">
      <p className="text-[10px] tracking-[0.3em] text-[#5a6a5a] uppercase">{label}</p>
      <p className="font-display text-2xl neon-text mt-1">{value}</p>
      {sub && <p className="text-[10px] text-[#5a6a5a] mt-1">{sub}</p>}
    </div>
  );
}
