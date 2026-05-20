import { useState } from "react";
import { NeonButton } from "./ui/NeonButton";

export function FakeAnswerPanel({ payload, onSubmit, submitted, submittedCount, total }) {
  const [text, setText] = useState("");

  if (payload?.subPhase === "vote") {
    return null;
  }

  const handleSubmit = () => {
    if (!text.trim() || submitted) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="w-full">
      <p className="text-[#ffaa00] text-xs text-center tracking-widest mb-4">
        🎭 {payload?.hint}
      </p>
      <p className="font-display text-lg text-center tracking-wide mb-6">
        {payload?.question}
      </p>
      <input
        type="text"
        maxLength={40}
        value={text}
        disabled={submitted}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Ta fausse réponse piège..."
        className="w-full bg-[#0a0a0c] border border-[#39ff14] px-4 py-3 text-[#39ff14] text-sm mb-4 focus:outline-none disabled:opacity-40"
      />
      <NeonButton
        disabled={submitted || !text.trim()}
        onClick={handleSubmit}
        className="w-full"
      >
        {submitted ? "PIÈGE DÉPLOYÉ" : "ENVOYER LE PIÈGE"}
      </NeonButton>
      <p className="text-center text-[10px] text-[#5a6a5a] mt-4">
        Pièges prêts : {submittedCount}/{total}
      </p>
    </div>
  );
}
