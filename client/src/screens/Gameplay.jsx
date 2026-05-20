import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { GlitchOverlay } from "../components/ui/GlitchOverlay";
import { NeonButton } from "../components/ui/NeonButton";

const LABELS = ["A", "B", "C", "D"];

function ChaosOptions({ options, onSelect, disabled, pressure }) {
  const [shuffled, setShuffled] = useState(() =>
    options.map((o, i) => ({ label: o, origIndex: i, visible: true }))
  );

  useEffect(() => {
    setShuffled(options.map((o, i) => ({ label: o, origIndex: i, visible: true })));
  }, [options]);

  useEffect(() => {
    if (!options.length) return;
    const interval = setInterval(() => {
      setShuffled((prev) => {
        const next = [...prev];
        const action = Math.floor(Math.random() * 3);
        if (action === 0) {
          const i = Math.floor(Math.random() * next.length);
          const j = Math.floor(Math.random() * next.length);
          [next[i], next[j]] = [next[j], next[i]];
        } else if (action === 1) {
          const i = Math.floor(Math.random() * next.length);
          next[i] = { ...next[i], visible: !next[i].visible };
        }
        return next;
      });
    }, 800 - pressure * 100);
    return () => clearInterval(interval);
  }, [options, pressure]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {shuffled.map((opt, displayIdx) => (
        <AnimatePresence key={opt.origIndex}>
          {opt.visible && (
            <motion.button
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              disabled={disabled}
              onClick={() => onSelect(opt.origIndex)}
              className="neon-btn p-4 text-left text-sm disabled:opacity-40 glitch-active"
            >
              <span className="text-[#5a6a5a] mr-2">
                {LABELS[displayIdx]} //
              </span>
              {opt.label}
            </motion.button>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}

function MemoryGame({ payload, onSubmit, disabled }) {
  const [phase, setPhase] = useState("show");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setPhase("show");
    setSelected([]);
    const t = setTimeout(() => setPhase("input"), payload.displayMs ?? 2500);
    return () => clearTimeout(t);
  }, [payload]);

  const toggle = (idx) => {
    if (phase !== "input" || disabled) return;
    setSelected((s) => {
      const next = [...s, idx];
      if (next.length === payload.symbols.length) {
        onSubmit(next);
      }
      return next;
    });
  };

  if (phase === "show") {
    return (
      <div className="flex gap-4 justify-center py-8">
        {payload.symbols.map((s, i) => (
          <motion.span
            key={i}
            className="text-5xl neon-text"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            {s}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-xs text-[#5a6a5a] mb-4 tracking-widest">
        REPRODUIS LA SÉQUENCE
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {payload.symbols.map((s, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled || selected.includes(i)}
            onClick={() => toggle(i)}
            className="w-16 h-16 border border-[#39ff14] text-2xl hover:bg-[rgba(57,255,20,0.15)] disabled:opacity-30"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-[#5a6a5a] mt-4">
        {selected.length} / {payload.symbols.length}
      </p>
    </div>
  );
}

export function Gameplay({ gameState, selfId, onAnswer, answered }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const payload = gameState.roundPayload;
  const pressure = gameState.pressureLevel ?? 1;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!gameState.roundEndsAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((gameState.roundEndsAt - Date.now()) / 1000));
      setTimeLeft(left);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [gameState.roundEndsAt]);

  const handleSelect = useCallback(
    (idx) => {
      if (!answered && !me?.eliminated) onAnswer(idx);
    },
    [answered, me, onAnswer]
  );

  const isChaos = payload?.chaos || payload?.type === "chaos_round";
  const isSudden = payload?.suddenDeath || payload?.type === "sudden_death";
  const eliminated = me?.eliminated;

  if (eliminated) {
    return (
      <div className="h-full flex items-center justify-center grid-bg scanlines">
        <div className="text-center p-8 border border-[#ff2a2a] danger-box">
          <p className="font-display text-2xl text-[#ff2a2a] tracking-widest">
            TERMINATED
          </p>
          <p className="text-xs text-[#5a6a5a] mt-4">Mode spectateur — la partie continue</p>
          <p className="neon-text mt-2">{gameState.survivorsCount} survivants</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex grid-bg scanlines ${isChaos ? "glitch-active" : ""}`}>
      <GlitchOverlay active={isChaos || pressure >= 4} intensity={pressure / 5} />
      <Sidebar username={me?.username} activeNav="survivors" />
      <div className="flex-1 flex flex-col relative">
        <TopBar
          subtitle={gameState.currentMinigame?.name}
          survivors={gameState.survivorsCount}
          lives={me?.lives}
        />
        <main className="flex-1 flex p-6 gap-4 overflow-hidden">
          <div className="w-12 shrink-0 flex flex-col items-center border border-[#1a2a1a] p-2">
            <span className="text-[8px] text-[#5a6a5a] writing-mode-vertical rotate-180" style={{ writingMode: "vertical-rl" }}>
              THREAT
            </span>
            <div className="flex-1 w-2 bg-[#1a1a1a] mt-2 relative">
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#ff2a2a] transition-all"
                style={{ height: `${(pressure / 5) * 100}%` }}
              />
            </div>
            <span className="text-[8px] text-[#ff2a2a] mt-1">{pressure}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="flex items-center gap-4 mb-4 w-full max-w-2xl">
              <span className="font-display text-3xl text-[#ff2a2a] tabular-nums">
                {String(timeLeft).padStart(2, "0")}
              </span>
              <span className="text-[10px] tracking-[0.3em] text-[#ff2a2a] flex-1 text-center">
                {pressure >= 4 ? "TERMINATION IMMINENT" : "EXTREME PRESSURE"}
              </span>
              <span className="font-display text-3xl text-[#ff2a2a] tabular-nums">
                {String(timeLeft).padStart(2, "0")}
              </span>
            </div>

            {isSudden && (
              <p className="text-[#ff2a2a] text-xs tracking-widest mb-2 pulse-neon">
                💣 SUDDEN DEATH — UNE ERREUR = ÉLIMINATION
              </p>
            )}

            <div className="w-full max-w-2xl neon-box bg-[#08080a] p-8 relative">
              {payload?.type === "memory_game" ? (
                <MemoryGame
                  payload={payload}
                  onSubmit={onAnswer}
                  disabled={answered}
                />
              ) : (
                <>
                  <p className="font-display text-lg text-center tracking-wide mb-8 leading-relaxed">
                    {payload?.question}
                  </p>
                  {isChaos ? (
                    <ChaosOptions
                      options={payload?.options ?? []}
                      onSelect={handleSelect}
                      disabled={answered}
                      pressure={pressure}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {(payload?.options ?? []).map((opt, i) => (
                        <NeonButton
                          key={i}
                          disabled={answered}
                          onClick={() => handleSelect(i)}
                          className="text-left text-sm py-4"
                        >
                          <span className="text-[#5a6a5a] mr-2">
                            {LABELS[i]} // {String(i + 1).padStart(2, "0")}
                          </span>
                          {opt}
                        </NeonButton>
                      ))}
                    </div>
                  )}
                </>
              )}
              {answered && (
                <p className="text-center text-[#39ff14] text-xs mt-6 tracking-widest">
                  SIGNAL LOCKED — EN ATTENTE…
                </p>
              )}
            </div>

            <p className="text-[10px] text-[#5a6a5a] mt-6 tracking-widest">
              {gameState.survivorsCount} SURVIVORS REMAINING
            </p>
          </div>
        </main>

        <nav className="h-10 border-t border-[#1a2a1a] flex items-center justify-center gap-8 text-[10px] tracking-widest">
          <span className="text-[#39ff14]">BATTLE</span>
          <span className="text-[#5a6a5a]">STATS</span>
          <span className="text-[#5a6a5a]">SKILL</span>
          <span className="text-[#5a6a5a]">PROFILE</span>
        </nav>
      </div>
    </div>
  );
}
