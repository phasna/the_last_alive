import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { AvatarGrid } from "../components/AvatarGrid";
import { NeonButton } from "../components/ui/NeonButton";

function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Lobby({ gameState, selfId, onReady, ready, onCopyCode }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const timer = formatTimer(gameState.lobbyCountdown ?? 0);
  const minPlayers = gameState.minPlayers ?? 2;
  const count = gameState.players.length;
  const needMore = count < minPlayers;
  const readyCount = gameState.players.filter((p) => p.ready).length;
  const readyPct = count > 0 ? Math.round((readyCount / count) * 100) : 0;

  return (
    <div className="h-full min-h-dvh flex grid-bg scanlines ambient-bg">
      <Sidebar username={me?.username ?? "OPERATOR"} activeNav="survivors" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar timer={timer} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-[#5a6a5a] mb-1">
                WAITING FOR SURVIVORS
              </p>
              <p className="font-display text-2xl neon-text tracking-widest">
                ROOM {gameState.code}
              </p>
            </div>
            <div className="panel px-4 py-3 min-w-[200px]">
              <div className="flex justify-between text-[10px] tracking-widest mb-2">
                <span className="text-[#5a6a5a]">READY</span>
                <span className="text-[#39ff14]">
                  {readyCount}/{count}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${readyPct}%` }}
                />
              </div>
            </div>
          </div>

          <AvatarGrid players={gameState.players} selfId={selfId} />

          {needMore && (
            <div className="mt-6 panel border-[#ffaa00]/30 px-4 py-3 text-center">
              <p className="text-[#ffaa00] text-xs tracking-widest">
                Il faut au moins {minPlayers} joueurs — ouvre un 2ᵉ onglet et rejoins avec le
                code{" "}
                <span className="text-[#39ff14] font-display text-sm">
                  {gameState.code}
                </span>
              </p>
            </div>
          )}
          {!needMore && readyCount < count && (
            <p className="text-center text-[#5a6a5a] text-xs mt-6 tracking-widest">
              En attente que tous les opérateurs soient READY
            </p>
          )}
          {!needMore && readyCount === count && (
            <p className="text-center text-[#39ff14] text-xs mt-6 tracking-widest pulse-neon">
              Tous prêts — lancement imminent…
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 panel px-5 py-3">
              <span className="text-[10px] text-[#5a6a5a] tracking-widest">CODE</span>
              <span className="font-display text-xl neon-text tracking-[0.3em]">
                {gameState.code}
              </span>
              <button
                type="button"
                onClick={() => onCopyCode?.(gameState.code)}
                className="text-[10px] text-[#39ff14] border border-[#39ff14]/40 px-2 py-1 hover:bg-[rgba(57,255,20,0.1)]"
              >
                COPIER
              </button>
            </div>
            <NeonButton
              onClick={() => onReady(!ready)}
              variant={ready ? "secondary" : "primary"}
              className="min-w-[220px] py-4"
            >
              {ready ? "STANDBY" : "READY UP"}
            </NeonButton>
          </div>
        </main>
        <footer className="p-4 border-t border-[#1a2a1a]">
          <div className="danger-box p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-sm">
            <div>
              <p className="text-[#ff2a2a] text-xs font-display tracking-widest">
                RESTRICTED ZONE: SECTOR_07
              </p>
              <p className="text-[10px] text-[#5a6a5a] mt-1 max-w-xl leading-relaxed">
                Radiation léthale détectée. Seuls les opérateurs prêts seront téléportés dans
                l&apos;arène.
              </p>
            </div>
            <span className="chip chip--active shrink-0">
              {gameState.players.length} / 16 OPERATORS
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
