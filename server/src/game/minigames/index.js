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
    description:
      "Leaders au score : 1 piège par partie. Les autres devinent la vraie réponse.",
    icon: "🎭",
    baseTimer: 18,
  },
};

/**
 * @param {string[]} exclude — mini-jeux déjà joués récemment
 * @param {number} roundNumber — manches déjà terminées (0 = toute première manche)
 */
export function pickRandomMinigame(exclude = [], roundNumber = 0) {
  const earlyRoundBan =
    roundNumber < 1 ? ["fake_answer", "sudden_death"] : roundNumber < 2 ? ["sudden_death"] : [];

  const banned = new Set([...exclude, ...earlyRoundBan]);
  let pool = MINIGAME_TYPES.filter((t) => !banned.has(t));

  if (pool.length === 0) {
    pool = MINIGAME_TYPES.filter((t) => !exclude.includes(t));
  }
  if (pool.length === 0) {
    pool = [...MINIGAME_TYPES];
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
