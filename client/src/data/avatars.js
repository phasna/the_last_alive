export const AVATARS = [
  { id: "skull", emoji: "☠", label: "REAPER", color: "#39ff14" },
  { id: "mask", emoji: "🎭", label: "PHANTOM", color: "#ffaa00" },
  { id: "robot", emoji: "🤖", label: "CYBORG", color: "#4d9fff" },
  { id: "alien", emoji: "👾", label: "GLITCH", color: "#b44dff" },
  { id: "fire", emoji: "🔥", label: "BURNER", color: "#ff4d4d" },
  { id: "ice", emoji: "❄️", label: "FROST", color: "#00ffcc" },
  { id: "bolt", emoji: "⚡", label: "STRIKER", color: "#ffe14d" },
  { id: "wolf", emoji: "🐺", label: "HUNTER", color: "#c8e6c8" },
  { id: "snake", emoji: "🐍", label: "VIPER", color: "#7cfc00" },
  { id: "eye", emoji: "👁️", label: "WATCHER", color: "#ff2a2a" },
  { id: "crown", emoji: "👑", label: "ELITE", color: "#ffd700" },
  { id: "bomb", emoji: "💣", label: "SABOTEUR", color: "#ff6b35" },
];

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
