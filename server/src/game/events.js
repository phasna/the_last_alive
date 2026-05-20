export const ARENA_EVENTS = [
  {
    id: "timer_crush",
    name: "TIMER CRUSH",
    description: "Le chronomètre est divisé par deux.",
    icon: "⏱️",
  },
  {
    id: "blackout",
    name: "BLACKOUT",
    description: "Les réponses disparaissent par intermittence.",
    icon: "🌑",
  },
  {
    id: "double_damage",
    name: "DOUBLE DAMAGE",
    description: "Chaque échec retire 2 vies.",
    icon: "☠️",
  },
  {
    id: "final_countdown",
    name: "FINAL COUNTDOWN",
    description: "Plus que 5 secondes pour répondre.",
    icon: "💀",
  },
];

export function pickArenaEvent(roundNumber) {
  if (roundNumber < 2) return null;
  if (Math.random() > 0.35) return null;
  return ARENA_EVENTS[Math.floor(Math.random() * ARENA_EVENTS.length)];
}

export function applyEventToTimer(baseSec, event) {
  if (!event) return baseSec;
  if (event.id === "timer_crush") return Math.max(4, Math.floor(baseSec / 2));
  if (event.id === "final_countdown") return Math.min(baseSec, 5);
  return baseSec;
}

export function getDamageMultiplier(event) {
  return event?.id === "double_damage" ? 2 : 1;
}
