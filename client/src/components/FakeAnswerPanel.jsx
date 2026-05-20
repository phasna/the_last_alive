import { useState } from "react";
import { NeonButton } from "./ui/NeonButton";

/** Phase 1 : seuls les leaders au score posent 1 piège (1× par partie) */
export function FakeAnswerPanel({
  payload,
  onSubmit,
  submitted,
  submittedCount,
  eligibleCount,
}) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || submitted) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="w-full">
      <p className="text-[#ffaa00] text-xs text-center tracking-widest mb-2">
        🎭 PIÈGE UNIQUE — LEADERS AU SCORE
      </p>
      <p className="text-[10px] text-center text-[#5a6a5a] mb-4 leading-relaxed">
        {payload?.hint}
      </p>
      <p className="font-display text-lg text-center tracking-wide mb-2">
        {payload?.question}
      </p>
      <p className="text-[10px] text-center text-[#39ff14] mb-6">
        Invente une réponse <span className="text-[#ff2a2a]">FAUSSE</span> pour
        éliminer ceux qui la choisiront
      </p>
      <input
        type="text"
        maxLength={40}
        value={text}
        disabled={submitted}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Ex: une réponse plausible mais fausse..."
        className="w-full bg-[#0a0a0c] border border-[#ffaa00] px-4 py-3 text-[#ffaa00] text-sm mb-4 focus:outline-none disabled:opacity-40"
      />
      <NeonButton
        disabled={submitted || !text.trim()}
        onClick={handleSubmit}
        className="w-full border-[#ffaa00] text-[#ffaa00]"
      >
        {submitted ? "PIÈGE DÉPLOYÉ (1/1)" : "LANCER LE PIÈGE"}
      </NeonButton>
      <p className="text-center text-[10px] text-[#5a6a5a] mt-4">
        Pièges des leaders : {submittedCount}/{eligibleCount}
      </p>
    </div>
  );
}

/** Les autres joueurs attendent la phase de vote */
export function FakeAnswerWait({ payload, me }) {
  const used = me?.fakeTrapUsed;
  const lowScore = !used && payload?.eligibleTrapNames?.length > 0;

  return (
    <div className="w-full text-center py-6">
      <p className="font-display text-lg tracking-wide mb-4">{payload?.question}</p>
      {used ? (
        <p className="text-[#5a6a5a] text-xs tracking-widest">
          Tu as déjà utilisé ton piège cette partie
        </p>
      ) : lowScore ? (
        <p className="text-[#ffaa00] text-xs tracking-widest max-w-sm mx-auto">
          Score insuffisant — seuls les leaders peuvent piéger :{" "}
          <span className="text-[#39ff14]">
            {payload.eligibleTrapNames.join(", ")}
          </span>
        </p>
      ) : (
        <p className="text-[#5a6a5a] text-xs tracking-widest">
          Aucun leader ne pose de piège — vote imminent…
        </p>
      )}
      <p className="text-[#39ff14] text-[10px] mt-6 pulse-neon tracking-widest">
        PRÉPARE-TOI À DEVINER LA VRAIE RÉPONSE
      </p>
    </div>
  );
}
