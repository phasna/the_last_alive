import { getCachedFakeAnswerPrompts } from "../db/cache.js";

export function getAllFakeAnswerPrompts() {
  return getCachedFakeAnswerPrompts();
}

export function pickFakeAnswerPrompt(usedIds = new Set()) {
  const all = getAllFakeAnswerPrompts();
  if (all.length === 0) {
    return {
      id: "fallback",
      question: "QUEL EST LE PLUS PETIT PAYS DU MONDE ?",
      correctAnswer: "VATICAN",
    };
  }

  let pool = all.filter((p) => !usedIds.has(p.id));
  if (pool.length === 0) pool = all;
  return pool[Math.floor(Math.random() * pool.length)];
}
