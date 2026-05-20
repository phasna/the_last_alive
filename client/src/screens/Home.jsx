import { useState } from "react";
import { motion } from "framer-motion";
import { NeonButton } from "../components/ui/NeonButton";

export function Home({ onCreate, onJoin, connected, connecting, error }) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState("menu");
  const [loading, setLoading] = useState(false);

  const profile = {
    username: username.trim() || "OPERATOR_01",
    avatar: "default",
  };

  const handleCreate = async () => {
    setLoading(true);
    await onCreate({ ...profile, isPublic: true });
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setLoading(true);
    await onJoin(roomCode.trim().toUpperCase(), profile);
    setLoading(false);
  };

  return (
    <div className="min-h-full grid-bg scanlines flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050506] to-[#050506]" />
      <motion.div
        className="relative z-10 w-full max-w-lg p-8 neon-box bg-[#08080a]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] tracking-[0.5em] text-[#5a6a5a] text-center mb-2">
          SURVIVAL ARENA · MULTIPLAYER
        </p>
        <h1 className="font-display text-4xl text-center neon-text mb-2 tracking-wider">
          LAST ONE ALIVE
        </h1>
        <p className="text-center text-xs text-[#5a6a5a] mb-8 tracking-wide">
          Survis aux mini-jeux. Perds tes 3 vies et tu es éliminé.
        </p>

        {connecting && !error && (
          <p className="text-center text-[#5a6a5a] text-xs mb-4">
            Connexion au serveur…
          </p>
        )}
        {error && (
          <p className="text-center text-[#ff2a2a] text-xs mb-4">{error}</p>
        )}
        {connected && (
          <p className="text-center text-[#39ff14] text-[10px] mb-4 tracking-widest">
            ● SERVEUR CONNECTÉ
          </p>
        )}

        <label className="block text-[10px] tracking-widest text-[#5a6a5a] mb-1">
          CODENAME
        </label>
        <input
          type="text"
          maxLength={16}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="OPERATOR_01"
          className="w-full bg-[#0a0a0c] border border-[#1a2a1a] px-4 py-3 text-[#39ff14] font-mono text-sm mb-6 focus:border-[#39ff14] outline-none"
        />

        {mode === "menu" && (
          <div className="flex flex-col gap-3">
            <NeonButton
              disabled={!connected || loading}
              onClick={() => setMode("create")}
              className="w-full"
            >
              Lancer une partie publique
            </NeonButton>
            <NeonButton
              disabled={!connected || loading}
              onClick={() => setMode("join")}
              className="w-full"
            >
              Rejoindre avec un code
            </NeonButton>
          </div>
        )}

        {mode === "create" && (
          <div className="flex flex-col gap-3">
            <NeonButton disabled={loading} onClick={handleCreate} className="w-full">
              {loading ? "INITIALISATION…" : "CRÉER LA ROOM"}
            </NeonButton>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="text-[10px] text-[#5a6a5a] hover:text-[#39ff14]"
            >
              ← RETOUR
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="CODE ROOM"
              className="w-full bg-[#0a0a0c] border border-[#1a2a1a] px-4 py-3 text-[#39ff14] font-mono text-sm tracking-[0.3em] text-center focus:border-[#39ff14] outline-none"
            />
            <NeonButton disabled={loading || !roomCode} onClick={handleJoin} className="w-full">
              {loading ? "CONNEXION…" : "REJOINDRE"}
            </NeonButton>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="text-[10px] text-[#5a6a5a] hover:text-[#39ff14]"
            >
              ← RETOUR
            </button>
          </div>
        )}

        <p className="text-[9px] text-center text-[#3a4a3a] mt-8">
          ❤️❤️❤️ · 6 types de mini-jeux · temps réel
        </p>
      </motion.div>
    </div>
  );
}
