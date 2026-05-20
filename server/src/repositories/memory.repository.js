import { getCachedMemorySequences } from "../db/cache.js";

export function getAllMemorySequences() {
  return getCachedMemorySequences();
}

export function getRandomMemorySequence() {
  const all = getAllMemorySequences();
  if (all.length === 0) {
    return {
      symbols: ["◆", "▲", "●", "■"],
      correctOrder: [0, 2, 1, 3],
    };
  }
  return all[Math.floor(Math.random() * all.length)];
}
