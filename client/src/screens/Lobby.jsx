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
  const allReady = !needMore && readyCount === count && count > 0;

  return (
    <div className="h-dvh max-h-dvh flex overflow-hidden grid-bg scanlines ambient-bg vignette">
      <Sidebar
        username={me?.username ?? "OPERATOR"}
        avatarId={me?.avatar}
        activeNav="survivors"
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBar
          timer={timer}
          subtitle={`ARÈNE · ${count}/${minPlayers} min.`}
        />

        <main className="flex-1 flex flex-col gap-3 p-3 sm:p-4 min-h-0 overflow-hidden">
          {needMore && (
            <div className="shrink-0 panel border-[#ffaa00]/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="status-pill status-pill--warn shrink-0">
                  <span className="status-dot status-dot--pulse" />
                  EN ATTENTE
                </span>
                <div>
                  <p className="text-[#ffaa00] text-xs sm:text-sm tracking-wide font-display">
                    Il faut au moins {minPlayers} opérateurs pour lancer
                  </p>
                  <p className="text-[10px] text-[#5a6a5a] mt-1">
                    Ouvre un 2ᵉ onglet → Rejoindre avec le code ci-contre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCopyCode?.(gameState.code)}
                className="font-display text-2xl neon-text tracking-[0.25em] hover:opacity-80 text-left sm:text-right"
              >
                {gameState.code}
              </button>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,300px)] gap-3 min-h-0">
            {/* Arène — grille 16 slots */}
            <section className="panel corner-brackets flex flex-col min-h-0 overflow-hidden">
              <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1a2a1a]">
                <div>
                  <p className="text-[9px] tracking-[0.35em] text-[#5a6a5a]">
                    WAITING FOR SURVIVORS
                  </p>
                  <p className="font-display text-lg sm:text-xl neon-text tracking-widest">
                    ROOM {gameState.code}
                  </p>
                </div>
                <span className="chip chip--active shrink-0">
                  {count} / 16
                </span>
              </header>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <AvatarGrid players={gameState.players} selfId={selfId} />
              </div>
            </section>

            {/* Panneau action — toujours visible */}
            <aside className="flex flex-col gap-3 min-h-0 shrink-0">
              <div className="panel p-4 space-y-4">
                <div>
                  <p className="text-[9px] text-[#5a6a5a] tracking-widest mb-2">
                    CODE D&apos;INVITATION
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl neon-text tracking-[0.2em] flex-1">
                      {gameState.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopyCode?.(gameState.code)}
                      className="shrink-0 text-[10px] tracking-widest px-3 py-2 border border-[#39ff14]/50 text-[#39ff14] hover:bg-[rgba(57,255,20,0.1)] transition-colors"
                    >
                      COPIER
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] tracking-widest mb-2">
                    <span className="text-[#5a6a5a]">PRÊTS</span>
                    <span className="text-[#39ff14]">
                      {readyCount} / {count}
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-bar__fill h-full"
                      style={{ width: `${readyPct}%` }}
                    />
                  </div>
                </div>

                <NeonButton
                  onClick={() => onReady(!ready)}
                  variant={ready ? "secondary" : "primary"}
                  className="w-full py-4 text-sm"
                >
                  {ready ? "ANNULER — STANDBY" : "READY UP"}
                </NeonButton>

                {allReady && (
                  <p className="text-center text-[#39ff14] text-[10px] tracking-widest pulse-neon">
                    Tous prêts — téléportation imminente
                  </p>
                )}
                {!needMore && !allReady && (
                  <p className="text-center text-[#5a6a5a] text-[10px] tracking-widest">
                    En attente des autres opérateurs…
                  </p>
                )}
              </div>

              <div className="danger-box p-3 text-[10px] leading-relaxed">
                <p className="text-[#ff2a2a] font-display text-xs tracking-widest mb-1">
                  SECTOR_07 — ZONE RESTREINTE
                </p>
                <p className="text-[#5a6a5a]">
                  Seuls les opérateurs READY seront envoyés dans l&apos;arène.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
