import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { GlitchOverlay } from "../components/ui/GlitchOverlay";
import { NeonButton } from "../components/ui/NeonButton";
import { CombatFeed } from "../components/CombatFeed";
import { EventBanner } from "../components/EventBanner";
import { FakeAnswerPanel } from "../components/FakeAnswerPanel";

const LABELS = ["A", "B", "C", "D"];

function ChaosOptions({ options, onSelect, disabled, pressure, blackout }) {
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
        } else if (action === 1 || blackout) {
          const i = Math.floor(Math.random() * next.length);
          next[i] = { ...next[i], visible: blackout ? Math.random() > 0.4 : !next[i].visible };
        }
        return next;
      });
    }, blackout ? 400 : 800 - pressure * 100);
    return () => clearInterval(interval);
  }, [options, pressure, blackout]);

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
              <span className="text-[#5a6a5a] mr-2">{LABELS[displayIdx]} //</span>
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
      if (next.length === payload.symbols.length) onSubmit(next);
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
    </div>
  );
}

export function Gameplay({ gameState, selfId, onAnswer, answered, onSound }) {
  const me = gameState.players.find((p) => p.id === selfId);
  const payload = gameState.roundPayload;
  const pressure = gameState.pressureLevel ?? 1;
  const event = gameState.activeEvent;
  const [timeLeft, setTimeLeft] = useState(0);
  const [fakeSubmitted, setFakeSubmitted] = useState(false);
  const lastTickRef = useRef(-1);

  useEffect(() => {
    setFakeSubmitted(false);
  }, [payload?.subPhase, gameState.roundNumber]);

  useEffect(() => {
    if (event && gameState.phase === "playing") onSound?.("event");
  }, [event?.id, gameState.roundNumber]);

  useEffect(() => {
    if (!gameState.roundEndsAt) return;
    const tick = () => {
      setTimeLeft(Math.max(0, Math.ceil((gameState.roundEndsAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [gameState.roundEndsAt]);

  useEffect(() => {
    if (
      gameState.phase === "playing" &&
      timeLeft > 0 &&
      timeLeft <= 3 &&
      timeLeft !== lastTickRef.current
    ) {
      lastTickRef.current = timeLeft;
      onSound?.("tick");
    }
  }, [timeLeft, gameState.phase, onSound]);

  const handleSelect = useCallback(
    (idx) => {
      if (!answered && !me?.eliminated) {
        onSound?.("select");
        onAnswer(idx);
      }
    },
    [answered, me, onAnswer, onSound]
  );

  const handleFakeSubmit = (text) => {
    onSound?.("select");
    setFakeSubmitted(true);
    onAnswer(text);
  };

  const isChaos = payload?.chaos || payload?.type === "chaos_round";
  const isSudden = payload?.suddenDeath || payload?.type === "sudden_death";
  const isFake = payload?.type === "fake_answer";
  const isFakeVote = isFake && payload?.subPhase === "vote";
  const isBlackout = event?.id === "blackout";
  const eliminated = me?.eliminated;

  if (eliminated) {
    return (
      <div className="h-full flex grid-bg scanlines relative">
        <CombatFeed feed={gameState.combatFeed} />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center p-8 border border-[#ff2a2a] danger-box glitch-active"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="font-display text-3xl text-[#ff2a2a] tracking-widest">
              TERMINATED
            </p>
            <p className="text-xs text-[#5a6a5a] mt-4">Mode spectateur</p>
            <p className="neon-text mt-4 text-2xl">{gameState.survivorsCount} survivants</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex grid-bg scanlines relative ${
        isChaos || isBlackout ? "glitch-active" : ""
      }`}
    >
      <GlitchOverlay
        active={isChaos || isBlackout || pressure >= 4}
        intensity={pressure / 5}
      />
      <CombatFeed feed={gameState.combatFeed} />
      <Sidebar username={me?.username} activeNav="survivors" />
      <div className="flex-1 flex flex-col relative min-w-0">
        <TopBar
          subtitle={`${gameState.currentMinigame?.name ?? ""}${me?.streak > 1 ? ` · STREAK x${me.streak}` : ""}`}
          survivors={gameState.survivorsCount}
          lives={me?.lives}
        />
        <main className="flex-1 flex p-6 gap-4 overflow-auto">
          <div className="w-12 shrink-0 flex flex-col items-center border border-[#1a2a1a] p-2">
            <span
              className="text-[8px] text-[#5a6a5a]"
              style={{ writingMode: "vertical-rl" }}
            >
              THREAT
            </span>
            <div className="flex-1 w-2 bg-[#1a1a1a] mt-2 relative min-h-[80px]">
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#ff2a2a] transition-all"
                style={{ height: `${(pressure / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center min-w-0">
            <EventBanner event={event} />

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
                💣 SUDDEN DEATH
              </p>
            )}

            <div className="w-full max-w-2xl neon-box bg-[#08080a] p-8">
              {isFake && !isFakeVote ? (
                <FakeAnswerPanel
                  payload={payload}
                  onSubmit={handleFakeSubmit}
                  submitted={fakeSubmitted || answered}
                  submittedCount={gameState.fakeSubmittedCount ?? 0}
                  total={gameState.survivorsCount}
                />
              ) : payload?.type === "memory_game" ? (
                <MemoryGame payload={payload} onSubmit={onAnswer} disabled={answered} />
              ) : (
                <>
                  {isFakeVote && (
                    <p className="text-[#ffaa00] text-xs text-center mb-4 tracking-widest">
                      🎭 Trouve la VRAIE réponse — évite les pièges !
                    </p>
                  )}
                  <p className="font-display text-lg text-center tracking-wide mb-8">
                    {payload?.question}
                  </p>
                  {isChaos || isBlackout ? (
                    <ChaosOptions
                      options={payload?.options ?? []}
                      onSelect={handleSelect}
                      disabled={answered}
                      pressure={pressure}
                      blackout={isBlackout}
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
                            {LABELS[i]} //
                          </span>
                          {opt}
                        </NeonButton>
                      ))}
                    </div>
                  )}
                </>
              )}
              {(answered || fakeSubmitted) && !isFakeVote && (
                <p className="text-center text-[#39ff14] text-xs mt-6 tracking-widest">
                  SIGNAL LOCKED — EN ATTENTE…
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
