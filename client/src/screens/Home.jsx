import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NeonButton } from "../components/ui/NeonButton";
import { AvatarPicker } from "../components/AvatarPicker";
import { CategoryPicker } from "../components/CategoryPicker";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { QUESTION_CATEGORIES } from "../data/categories.js";

const FEATURES = [
  { icon: "♥", label: "3 vies" },
  { icon: "⚡", label: "6 mini-jeux" },
  { icon: "◎", label: "Temps réel" },
];

export function Home({ onCreate, onJoin, connected, connecting, error }) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem("loa-avatar") || "skull"
  );
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [questionCategory, setQuestionCategory] = useState("all");
  const [categories, setCategories] = useState(QUESTION_CATEGORIES);

  useEffect(() => {
    if (mode !== "create") return;
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("loa-avatar", avatar);
  }, [avatar]);

  const profile = {
    username: username.trim() || "OPERATOR_01",
    avatar,
  };

  const handleCreate = async () => {
    setLoading(true);
    await onCreate({ ...profile, isPublic: true, questionCategory });
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setLoading(true);
    await onJoin(roomCode.trim().toUpperCase(), profile);
    setLoading(false);
  };

  const connectionStatus = error
    ? { variant: "err", label: error }
    : connecting
      ? { variant: "warn", label: "Connexion au serveur…" }
      : connected
        ? { variant: "ok", label: "Serveur connecté" }
        : { variant: "warn", label: "Hors ligne" };

  return (
    <div className="min-h-dvh grid-bg scanlines ambient-bg vignette flex items-center justify-center p-4 sm:p-8">
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">
        {/* Hero */}
        <motion.div
          className="text-center lg:text-left order-2 lg:order-1"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] tracking-[0.55em] text-[#5a6a5a] mb-4">
            SURVIVAL ARENA · MULTIPLAYER
          </p>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-6">
            <motion.div className="float shrink-0" aria-hidden>
              <PlayerAvatar avatarId={avatar} size="lg" highlight />
            </motion.div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl neon-text title-flicker tracking-wider leading-tight">
                LAST ONE
                <br />
                <span className="text-[#c8e6c8]">ALIVE</span>
              </h1>
              <p className="mt-4 text-sm text-[#7a8a7a] max-w-md leading-relaxed tracking-wide">
                Survis aux mini-jeux en équipe. Perds tes 3 vies et tu es éliminé —
                le dernier opérateur debout remporte l&apos;arène.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {FEATURES.map((f) => (
              <span key={f.label} className="chip chip--active">
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Form panel */}
        <motion.div
          className="order-1 lg:order-2 corner-brackets neon-box panel p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex justify-center mb-6">
            <span
              className={`status-pill status-pill--${connectionStatus.variant}`}
            >
              <span
                className={`status-dot ${connected ? "status-dot--pulse" : ""}`}
              />
              {connectionStatus.label}
            </span>
          </div>

          <label className="block text-[10px] tracking-[0.35em] text-[#5a6a5a] mb-2">
            CODENAME
          </label>
          <input
            type="text"
            maxLength={16}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="OPERATOR_01"
            className="input-neon mb-4"
          />

          <AvatarPicker value={avatar} onChange={setAvatar} />

          <AnimatePresence mode="wait">
            {mode === "menu" && (
              <motion.div
                key="menu"
                className="flex flex-col gap-3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <NeonButton
                  disabled={!connected || loading}
                  onClick={() => setMode("create")}
                  className="w-full py-4"
                >
                  Lancer une partie publique
                </NeonButton>
                <NeonButton
                  disabled={!connected || loading}
                  onClick={() => setMode("join")}
                  variant="secondary"
                  className="w-full py-4"
                >
                  Rejoindre avec un code
                </NeonButton>
              </motion.div>
            )}

            {mode === "create" && (
              <motion.div
                key="create"
                className="flex flex-col gap-3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <p className="text-[10px] text-[#5a6a5a] tracking-widest text-center mb-1">
                  Création d&apos;une room publique — choisis la catégorie
                </p>
                <CategoryPicker
                  categories={categories}
                  value={questionCategory}
                  onChange={setQuestionCategory}
                  disabled={loading || !connected}
                />
                <NeonButton
                  disabled={loading || !connected}
                  onClick={handleCreate}
                  className="w-full py-4"
                >
                  {loading ? "INITIALISATION…" : "CRÉER LA ROOM"}
                </NeonButton>
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="text-[10px] text-[#5a6a5a] hover:text-[#39ff14] tracking-widest transition-colors py-2"
                >
                  ← RETOUR
                </button>
              </motion.div>
            )}

            {mode === "join" && (
              <motion.div
                key="join"
                className="flex flex-col gap-3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <label className="block text-[10px] tracking-[0.35em] text-[#5a6a5a] mb-2 text-center">
                  CODE ROOM
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="NODE42"
                  className="input-neon text-center tracking-[0.4em] text-lg font-display"
                />
                <NeonButton
                  disabled={loading || !roomCode || !connected}
                  onClick={handleJoin}
                  className="w-full py-4"
                >
                  {loading ? "CONNEXION…" : "REJOINDRE"}
                </NeonButton>
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="text-[10px] text-[#5a6a5a] hover:text-[#39ff14] tracking-widest transition-colors py-2"
                >
                  ← RETOUR
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[9px] text-center text-[#3a4a3a] mt-8 tracking-wider">
            ESGI · Node.js · Socket.IO
          </p>
        </motion.div>
      </div>
    </div>
  );
}
