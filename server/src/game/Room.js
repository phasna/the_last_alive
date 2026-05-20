import { QUIZ_QUESTIONS, MEMORY_SEQUENCES } from "../data/questions.js";
import { FAKE_ANSWER_PROMPTS } from "../data/fakeAnswerPrompts.js";
import {
  MINIGAME_META,
  pickRandomMinigame,
} from "./minigames/index.js";
import {
  pickArenaEvent,
  applyEventToTimer,
  getDamageMultiplier,
} from "./events.js";

const INITIAL_LIVES = 3;
const MIN_PLAYERS = Number(process.env.MIN_PLAYERS) || 2;
const MAX_PLAYERS = 16;
const LOBBY_COUNTDOWN_SEC = 30;
const FAKE_SUBMIT_SEC = 12;
const FAKE_VOTE_SEC = 14;

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
    this.activeEvent = null;
    this.lastRoundRecap = [];
    this.combatFeed = [];
    this.fakeAnswers = new Map();
    this._broadcast = null;
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
      streak: 0,
      joinedAt: Date.now(),
      survivedMs: 0,
    };

    this.players.set(socketId, player);
    return { player: this.sanitizePlayer(player) };
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.roundAnswers.delete(socketId);
    this.fakeAnswers.delete(socketId);
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

  pushFeed(entry) {
    this.combatFeed.unshift({ ...entry, at: Date.now() });
    this.combatFeed = this.combatFeed.slice(0, 12);
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
          this.startLobbyCountdown(io, onTick);
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

  clearRoundTimer() {
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }
  }

  scheduleRoundEnd(broadcast, sec) {
    this.clearRoundTimer();
    this.roundEndsAt = Date.now() + sec * 1000;
    this.roundTimer = setTimeout(() => {
      if (this.currentMinigame === "fake_answer" && this.roundPayload?.subPhase === "submit_fake") {
        this.beginFakeVotePhase(broadcast);
      } else {
        this.resolveRound(broadcast);
      }
    }, sec * 1000);
  }

  startRound(io, broadcast) {
    this._broadcast = broadcast;
    this.roundNumber += 1;
    this.pressureLevel = Math.min(5, 1 + Math.floor(this.roundNumber / 2));
    this.phase = "playing";
    this.roundAnswers.clear();
    this.fakeAnswers.clear();
    this.activeEvent = pickArenaEvent(this.roundNumber);
    this.roundPayload = this.buildRoundPayload();
    const meta = MINIGAME_META[this.currentMinigame];

    let timerSec = Math.max(4, meta.baseTimer - (this.pressureLevel - 1) * 2);
    timerSec = applyEventToTimer(timerSec, this.activeEvent);

    if (this.currentMinigame === "fake_answer") {
      timerSec = FAKE_SUBMIT_SEC;
    }

    this.scheduleRoundEnd(broadcast, timerSec);
    broadcast(this);
  }

  buildRoundPayload() {
    const type = this.currentMinigame;

    if (type === "memory_game") {
      const seq =
        MEMORY_SEQUENCES[Math.floor(Math.random() * MEMORY_SEQUENCES.length)];
      return {
        type,
        displayMs: 3000 - this.pressureLevel * 200,
        symbols: seq.symbols,
        correctOrder: seq.correctOrder,
      };
    }

    if (type === "fake_answer") {
      const prompt =
        FAKE_ANSWER_PROMPTS[
          Math.floor(Math.random() * FAKE_ANSWER_PROMPTS.length)
        ];
      return {
        type,
        subPhase: "submit_fake",
        question: prompt.question,
        correctAnswer: prompt.correctAnswer,
        hint: "Invente une FAUSSE réponse pour piéger les autres.",
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

  beginFakeVotePhase(broadcast) {
    const payload = this.roundPayload;
    const alive = this.getAlivePlayers();
    const fakes = [];

    for (const p of alive) {
      const text = String(this.fakeAnswers.get(p.id) ?? "").trim();
      if (text && text.length > 0) {
        fakes.push({ text: text.slice(0, 40), authorId: p.id });
      }
    }

    const decoys = ["NEPTUNE", "1923", "BAMBOU", "ANTARCTIQUE", "PLATINE"];
    while (fakes.length < Math.min(3, alive.length)) {
      fakes.push({
        text: decoys[Math.floor(Math.random() * decoys.length)],
        authorId: null,
      });
    }

    const options = [
      { text: payload.correctAnswer, isCorrect: true, authorId: null },
      ...fakes.map((f) => ({ text: f.text, isCorrect: false, authorId: f.authorId })),
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.findIndex((o) => o.isCorrect);

    this.roundPayload = {
      type: "fake_answer",
      subPhase: "vote",
      question: payload.question,
      options: options.map((o) => o.text),
      correctIndex,
      trapAuthors: options.filter((o) => o.authorId).map((o) => o.authorId),
    };
    this.roundAnswers.clear();

    let timerSec = applyEventToTimer(FAKE_VOTE_SEC, this.activeEvent);
    this.scheduleRoundEnd(broadcast, timerSec);
    broadcast(this);
  }

  submitAnswer(socketId, answer) {
    const player = this.players.get(socketId);
    if (!player || player.eliminated || this.phase !== "playing") {
      return { error: "Cannot answer now" };
    }

    const type = this.currentMinigame;
    const payload = this.roundPayload;

    if (type === "fake_answer" && payload?.subPhase === "submit_fake") {
      if (this.fakeAnswers.has(socketId)) {
        return { error: "Already submitted" };
      }
      const text = String(answer ?? "").trim().slice(0, 40);
      if (!text) return { error: "Réponse vide" };
      this.fakeAnswers.set(socketId, text);

      const alive = this.getAlivePlayers();
      if (this.fakeAnswers.size >= alive.length) {
        this.clearRoundTimer();
        this.beginFakeVotePhase(this._broadcast);
        return { ok: true, phaseChange: true };
      }
      this._broadcast?.(this);
      return { ok: true };
    }

    if (this.roundAnswers.has(socketId)) {
      return { error: "Already answered" };
    }

    this.roundAnswers.set(socketId, { answer, at: Date.now() });

    const alive = this.getAlivePlayers();
    if (this.roundAnswers.size >= alive.length) {
      this.clearRoundTimer();
      return { resolved: true, state: this.resolveRound(this._broadcast) };
    }

    this._broadcast?.(this);
    return { ok: true };
  }

  resolveRound(broadcast) {
    const payload = this.roundPayload;
    const type = this.currentMinigame;
    const alive = this.getAlivePlayers();
    const dmgMult = getDamageMultiplier(this.activeEvent);
    this.lastRoundRecap = [];

    const hurt = (playerId, amount, reason) => {
      const before = this.players.get(playerId)?.lives ?? 0;
      this.damagePlayer(playerId, amount, reason);
      const after = this.players.get(playerId);
      if (!after) return;
      const lost = before - after.lives;
      if (lost > 0 || after.eliminated) {
        this.lastRoundRecap.push({
          username: after.username,
          damage: lost,
          eliminated: after.eliminated,
          reason,
        });
      }
    };

    if (type === "memory_game") {
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        const correct =
          ans &&
          JSON.stringify(ans.answer) === JSON.stringify(payload.correctOrder);
        if (!correct) hurt(p.id, 1 * dmgMult, "Mauvaise séquence");
      }
    } else if (type === "fake_answer" && payload.subPhase === "vote") {
      const correctIndex = payload.correctIndex;
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        const idx = ans?.answer;
        const pickedTrap = payload.trapAuthors?.includes(p.id) && idx !== correctIndex;
        const wrong = !ans || idx !== correctIndex || pickedTrap;
        if (wrong) {
          const dmg = (type === "sudden_death" ? p.lives : 1) * dmgMult;
          hurt(p.id, dmg, pickedTrap ? "Piégé par une fausse réponse" : "Mauvais choix");
        } else {
          p.streak = (p.streak || 0) + 1;
        }
      }
    } else if (type === "last_answer_loses") {
      let latest = null;
      let latestTime = -1;
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        if (ans && ans.at > latestTime) {
          latestTime = ans.at;
          latest = p.id;
        }
      }
      for (const p of alive.filter((x) => !this.roundAnswers.has(x.id))) {
        hurt(p.id, 1 * dmgMult, "Pas répondu à temps");
      }
      if (latest) hurt(latest, 1 * dmgMult, "Dernier à répondre");
    } else {
      const correctIndex = payload.correctIndex;
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        const idx = ans?.answer;
        const correct = idx === correctIndex;
        if (!ans || !correct) {
          const dmg = (type === "sudden_death" ? p.lives : 1) * dmgMult;
          hurt(p.id, dmg, !ans ? "Pas répondu" : "Mauvaise réponse");
        } else {
          p.streak = (p.streak || 0) + 1;
        }
      }
    }

    for (const entry of this.lastRoundRecap) {
      if (entry.eliminated) {
        this.pushFeed({
          type: "elimination",
          message: `${entry.username} ÉLIMINÉ`,
        });
      } else if (entry.damage > 0) {
        this.pushFeed({
          type: "damage",
          message: `${entry.username} -${entry.damage} ❤️`,
        });
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
    }, 2800);

    broadcast(this);
    return this.getPublicState();
  }

  damagePlayer(socketId, amount, reason = "") {
    const p = this.players.get(socketId);
    if (!p || p.eliminated) return;
    p.lives = Math.max(0, p.lives - amount);
    p.streak = 0;
    if (p.lives <= 0) {
      p.eliminated = true;
      p.survivedMs = Date.now() - this.createdAt;
      this.spectators.add(socketId);
      const killer = [...this.players.values()].find(
        (x) => x.id !== socketId && !x.eliminated
      );
      if (killer) killer.kills += 1;
    }
  }

  checkWinner() {
    const alive = this.getAlivePlayers();
    if (alive.length === 1) {
      const w = alive[0];
      w.survivedMs = Date.now() - this.createdAt;
      this.winner = this.sanitizePlayer(w);
      this.phase = "game_over";
      this.pushFeed({ type: "victory", message: `${w.username} — LAST SURVIVOR` });
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
      activeEvent: this.activeEvent,
      roundPayload: this.sanitizePayload(this.roundPayload),
      roundEndsAt: this.roundEndsAt,
      survivorsCount: this.getAliveCount(),
      minPlayers: MIN_PLAYERS,
      players: [...this.players.values()].map((p) => this.sanitizePlayer(p)),
      winner: this.winner,
      answeredCount: this.roundAnswers.size,
      fakeSubmittedCount: this.fakeAnswers.size,
      lastRoundRecap: this.lastRoundRecap,
      combatFeed: this.combatFeed,
    };
  }

  sanitizePayload(payload) {
    if (!payload) return null;
    const {
      correctIndex,
      correctOrder,
      correctAnswer,
      trapAuthors,
      ...safe
    } = payload;
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
      streak: p.streak || 0,
      survivedMs: p.survivedMs || 0,
    };
  }

  destroy() {
    if (this.lobbyInterval) clearInterval(this.lobbyInterval);
    this.clearRoundTimer();
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
