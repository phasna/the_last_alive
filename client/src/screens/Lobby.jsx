import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { AvatarGrid } from "../components/AvatarGrid";
import { NeonButton } from "../components/ui/NeonButton";

function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Lobby({ gameState, selfId, onReady, ready }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const timer = formatTimer(gameState.lobbyCountdown ?? 0);
  const minPlayers = gameState.minPlayers ?? 2;
  const count = gameState.players.length;
  const needMore = count < minPlayers;
  const readyCount = gameState.players.filter((p) => p.ready).length;

  return (
    <div className="h-full flex grid-bg scanlines">
      <Sidebar username={me?.username ?? "OPERATOR"} activeNav="survivors" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar timer={timer} />
        <main className="flex-1 p-6 overflow-auto">
          <p className="text-[10px] tracking-[0.4em] text-[#5a6a5a] mb-4">
            WAITING FOR SURVIVORS… · ROOM {gameState.code}
          </p>
          <AvatarGrid players={gameState.players} selfId={selfId} />

          {needMore && (
            <p className="text-center text-[#ffaa00] text-xs mt-6 tracking-widest">
              Il faut au moins {minPlayers} joueurs pour lancer la partie — ouvre un 2ᵉ
              onglet et rejoins avec le code{" "}
              <span className="text-[#39ff14] font-display">{gameState.code}</span>
            </p>
          )}
          {!needMore && readyCount < count && (
            <p className="text-center text-[#5a6a5a] text-xs mt-6 tracking-widest">
              En attente que tous les opérateurs soient READY ({readyCount}/{count})
            </p>
          )}
          {!needMore && readyCount === count && (
            <p className="text-center text-[#39ff14] text-xs mt-6 tracking-widest pulse-neon">
              Tous prêts — lancement imminent…
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[10px] text-[#5a6a5a]">
              Code room :{" "}
              <span className="text-[#39ff14] font-display tracking-widest">
                {gameState.code}
              </span>
            </p>
            <NeonButton onClick={() => onReady(!ready)} className="min-w-[200px]">
              {ready ? "STANDBY" : "READY UP"}
            </NeonButton>
          </div>
        </main>
        <footer className="p-4 border-t border-[#1a2a1a]">
          <div className="danger-box p-4 flex justify-between items-center gap-4">
            <div>
              <p className="text-[#ff2a2a] text-xs font-display tracking-widest">
                RESTRICTED ZONE: SECTOR_07
              </p>
              <p className="text-[10px] text-[#5a6a5a] mt-1 max-w-xl">
                Radiation léthale détectée. Seuls les opérateurs prêts seront téléportés
                dans l&apos;arène. Échec = élimination permanente du registre.
              </p>
            </div>
            <span className="text-[10px] text-[#5a6a5a] shrink-0">
              {gameState.players.length} / 16 OPERATORS
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
