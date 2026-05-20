import { QUIZ_QUESTIONS, MEMORY_SEQUENCES } from "../data/questions.js";
import {
  MINIGAME_META,
  pickRandomMinigame,
} from "./minigames/index.js";

const INITIAL_LIVES = 3;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 16;
const LOBBY_COUNTDOWN_SEC = 30;

export class Room {
  constructor(code, isPublic = true) {
    this.code = code;
    this.isPublic = isPublic;
    this.phase = "lobby";
    this.players = new Map();
    this.spectators = new Set();
    this.currentMinigame = null;
    this.roundPayload = null;
    this.roundAnswers = new Map();
    this.roundNumber = 0;
    this.pressureLevel = 1;
    this.winner = null;
    this.lobbyCountdown = LOBBY_COUNTDOWN_SEC;
    this.lobbyInterval = null;
    this.roundTimer = null;
    this.roundEndsAt = null;
    this.usedQuestions = new Set();
    this.lastMinigames = [];
    this.createdAt = Date.now();
  }

  addPlayer(socketId, { username, avatar }) {
    if (this.players.size >= MAX_PLAYERS) {
      return { error: "Room is full" };
    }
    if (this.phase !== "lobby" && this.phase !== "selecting") {
      return { error: "Game already in progress" };
    }

    const player = {
      id: socketId,
      username: username || `OPERATOR_${this.players.size + 1}`,
      avatar: avatar || "default",
      lives: INITIAL_LIVES,
      ready: false,
      eliminated: false,
      kills: 0,
      joinedAt: Date.now(),
      survivedMs: 0,
    };

    this.players.set(socketId, player);
    return { player: this.sanitizePlayer(player) };
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.roundAnswers.delete(socketId);
    this.spectators.delete(socketId);
    if (this.getAliveCount() <= 1 && this.phase !== "lobby") {
      this.checkWinner();
    }
  }

  setReady(socketId, ready) {
    const p = this.players.get(socketId);
    if (!p || p.eliminated) return null;
    p.ready = ready;
    return this.sanitizePlayer(p);
  }

  allReady() {
    const alive = [...this.players.values()].filter((p) => !p.eliminated);
    return alive.length >= MIN_PLAYERS && alive.every((p) => p.ready);
  }

  getAlivePlayers() {
    return [...this.players.values()].filter((p) => !p.eliminated && p.lives > 0);
  }

  getAliveCount() {
    return this.getAlivePlayers().length;
  }

  startLobbyCountdown(io, onTick) {
    if (this.lobbyInterval) return;
    this.lobbyCountdown = LOBBY_COUNTDOWN_SEC;
    this.lobbyInterval = setInterval(() => {
      this.lobbyCountdown -= 1;
      onTick(this);
      if (this.lobbyCountdown <= 0 || this.allReady()) {
        clearInterval(this.lobbyInterval);
        this.lobbyInterval = null;
        if (this.getAliveCount() >= MIN_PLAYERS) {
          this.beginSelection(io, onTick);
        } else {
          this.lobbyCountdown = LOBBY_COUNTDOWN_SEC;
        }
      }
    }, 1000);
  }

  beginSelection(io, broadcast) {
    this.phase = "selecting";
    this.currentMinigame = pickRandomMinigame(this.lastMinigames.slice(-2));
    this.lastMinigames.push(this.currentMinigame);
    broadcast(this);

    setTimeout(() => {
      this.startRound(io, broadcast);
    }, 3500);
  }

  startRound(io, broadcast) {
    this.roundNumber += 1;
    this.pressureLevel = Math.min(5, 1 + Math.floor(this.roundNumber / 2));
    this.phase = "playing";
    this.roundAnswers.clear();
    this.roundPayload = this.buildRoundPayload();
    const meta = MINIGAME_META[this.currentMinigame];
    const timerSec = Math.max(
      4,
      meta.baseTimer - (this.pressureLevel - 1) * 2
    );
    this.roundEndsAt = Date.now() + timerSec * 1000;

    broadcast(this);

    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = setTimeout(() => {
      this.resolveRound(broadcast);
    }, timerSec * 1000);
  }

  buildRoundPayload() {
    const type = this.currentMinigame;

    if (type === "memory_game") {
      const seq =
        MEMORY_SEQUENCES[
          Math.floor(Math.random() * MEMORY_SEQUENCES.length)
        ];
      return {
        type,
        displayMs: 3000 - this.pressureLevel * 200,
        symbols: seq.symbols,
        correctOrder: seq.correctOrder,
      };
    }

    let question = QUIZ_QUESTIONS.find((q) => !this.usedQuestions.has(q.id));
    if (!question) {
      this.usedQuestions.clear();
      question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    }
    this.usedQuestions.add(question.id);

    return {
      type,
      questionId: question.id,
      question: question.question,
      options: [...question.options],
      correctIndex: question.correctIndex,
      chaos: type === "chaos_round",
      suddenDeath: type === "sudden_death",
    };
  }

  submitAnswer(socketId, answer) {
    const player = this.players.get(socketId);
    if (!player || player.eliminated || this.phase !== "playing") {
      return { error: "Cannot answer now" };
    }
    if (this.roundAnswers.has(socketId)) {
      return { error: "Already answered" };
    }

    this.roundAnswers.set(socketId, {
      answer,
      at: Date.now(),
    });

    const alive = this.getAlivePlayers();
    if (this.roundAnswers.size >= alive.length) {
      if (this.roundTimer) {
        clearTimeout(this.roundTimer);
        this.roundTimer = null;
      }
      return { resolved: true, state: this.resolveRound(() => {}) };
    }

    return { ok: true };
  }

  resolveRound(broadcast) {
    const payload = this.roundPayload;
    const type = this.currentMinigame;
    const alive = this.getAlivePlayers();
    const eliminations = [];

    if (type === "memory_game") {
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        const correct =
          ans &&
          JSON.stringify(ans.answer) ===
            JSON.stringify(payload.correctOrder);
        if (!correct) {
          this.damagePlayer(p.id, 1);
          eliminations.push(p.id);
        }
      }
    } else {
      const correctIndex = payload.correctIndex;

      if (type === "last_answer_loses") {
        let latest = null;
        let latestTime = -1;
        for (const p of alive) {
          const ans = this.roundAnswers.get(p.id);
          if (ans && ans.at > latestTime) {
            latestTime = ans.at;
            latest = p.id;
          }
        }
        const noAnswer = alive.filter((p) => !this.roundAnswers.has(p.id));
        for (const p of noAnswer) {
          this.damagePlayer(p.id, 1);
          eliminations.push(p.id);
        }
        if (latest) {
          this.damagePlayer(latest, 1);
          eliminations.push(latest);
        }
      } else {
        for (const p of alive) {
          const ans = this.roundAnswers.get(p.id);
          const idx = ans?.answer;
          const correct = idx === correctIndex;
          if (!ans || !correct) {
            const dmg =
              type === "sudden_death" ? p.lives : 1;
            this.damagePlayer(p.id, dmg);
            eliminations.push(p.id);
          }
        }
      }
    }

    for (const pid of eliminations) {
      const killer = [...this.roundAnswers.entries()].find(
        ([id]) => id !== pid
      );
      if (killer) {
        const kPlayer = this.players.get(killer[0]);
        if (kPlayer && !kPlayer.eliminated) kPlayer.kills += 1;
      }
    }

    this.phase = "round_end";
    const aliveCount = this.getAliveCount();

    if (aliveCount <= 1) {
      this.checkWinner();
      broadcast(this);
      return this.getPublicState();
    }

    setTimeout(() => {
      this.phase = "selecting";
      this.currentMinigame = pickRandomMinigame(this.lastMinigames.slice(-2));
      this.lastMinigames.push(this.currentMinigame);
      broadcast(this);
      setTimeout(() => {
        this.startRound(null, broadcast);
      }, 3000);
    }, 2500);

    broadcast(this);
    return this.getPublicState();
  }

  damagePlayer(socketId, amount) {
    const p = this.players.get(socketId);
    if (!p || p.eliminated) return;
    p.lives = Math.max(0, p.lives - amount);
    if (p.lives <= 0) {
      p.eliminated = true;
      p.survivedMs = Date.now() - this.createdAt;
      this.spectators.add(socketId);
    }
  }

  checkWinner() {
    const alive = this.getAlivePlayers();
    if (alive.length === 1) {
      this.winner = this.sanitizePlayer(alive[0]);
      this.phase = "game_over";
    } else if (alive.length === 0) {
      this.phase = "game_over";
      this.winner = null;
    }
  }

  getPublicState() {
    return {
      code: this.code,
      isPublic: this.isPublic,
      phase: this.phase,
      roundNumber: this.roundNumber,
      pressureLevel: this.pressureLevel,
      lobbyCountdown: this.lobbyCountdown,
      currentMinigame: this.currentMinigame
        ? MINIGAME_META[this.currentMinigame]
        : null,
      roundPayload: this.sanitizePayload(this.roundPayload),
      roundEndsAt: this.roundEndsAt,
      survivorsCount: this.getAliveCount(),
      players: [...this.players.values()].map((p) => this.sanitizePlayer(p)),
      winner: this.winner,
      answeredCount: this.roundAnswers.size,
    };
  }

  sanitizePayload(payload) {
    if (!payload) return null;
    const { correctIndex, correctOrder, ...safe } = payload;
    return safe;
  }

  sanitizePlayer(p) {
    return {
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      lives: p.lives,
      ready: p.ready,
      eliminated: p.eliminated,
      kills: p.kills,
    };
  }

  destroy() {
    if (this.lobbyInterval) clearInterval(this.lobbyInterval);
    if (this.roundTimer) clearTimeout(this.roundTimer);
  }
}

export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
