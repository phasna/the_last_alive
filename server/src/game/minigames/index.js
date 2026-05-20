export const MINIGAME_TYPES = [
  "quiz_rush",
  "last_answer_loses",
  "chaos_round",
  "sudden_death",
  "memory_game",
  "fake_answer",
];

export const MINIGAME_META = {
  quiz_rush: {
    id: "quiz_rush",
    name: "QUIZ RUSH",
    description: "Réponds vite. Mauvaise réponse = -1 vie.",
    icon: "🧠",
    baseTimer: 12,
  },
  last_answer_loses: {
    id: "last_answer_loses",
    name: "LAST ANSWER LOSES",
    description: "Le dernier à répondre perd une vie, même si correct.",
    icon: "⚡",
    baseTimer: 15,
  },
  chaos_round: {
    id: "chaos_round",
    name: "CHAOS ROUND",
    description: "Les réponses bougent et disparaissent sous pression.",
    icon: "🔥",
    baseTimer: 10,
  },
  sudden_death: {
    id: "sudden_death",
    name: "SUDDEN DEATH",
    description: "Une seule erreur = élimination immédiate.",
    icon: "💣",
    baseTimer: 8,
  },
  memory_game: {
    id: "memory_game",
    name: "MEMORY GAME",
    description: "Mémorise la séquence de symboles.",
    icon: "🧩",
    baseTimer: 14,
  },
  fake_answer: {
    id: "fake_answer",
    name: "FAKE ANSWER",
    description: "Invente un piège. Devine la vraie réponse parmi les leurres.",
    icon: "🎭",
    baseTimer: 18,
  },
};

export function pickRandomMinigame(exclude = []) {
  const pool = MINIGAME_TYPES.filter((t) => !exclude.includes(t));
  const list = pool.length > 0 ? pool : MINIGAME_TYPES;
  return list[Math.floor(Math.random() * list.length)];
}
