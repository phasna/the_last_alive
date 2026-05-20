import { getQuestionsForCategory } from "../services/questionPool.service.js";
import { getCategoryMeta } from "../repositories/category.repository.js";
import { getRandomMemorySequence } from "../repositories/memory.repository.js";
import { pickFakeAnswerPrompt } from "../repositories/fakeAnswer.repository.js";
import { generateCodingRoomCode } from "../data/roomCodes.js";
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
  constructor(code, isPublic = true, questionCategory = "all") {
    this.code = code;
    this.isPublic = isPublic;
    this.questionCategory = questionCategory;
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
    this.trappedThisRound = [];
    this.combatFeed = [];
    this.fakeAnswers = new Map();
    this.usedFakePrompts = new Set();
    this._voteOptionMeta = null;
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
      avatar: avatar || "skull",
      lives: INITIAL_LIVES,
      ready: false,
      eliminated: false,
      kills: 0,
      streak: 0,
      points: 0,
      fakeTrapUsed: false,
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

  addPoints(socketId, amount) {
    const p = this.players.get(socketId);
    if (p && !p.eliminated) p.points = (p.points || 0) + amount;
  }

  /** Joueurs avec plus de points que le minimum (ou ex-aequo leader) — piège 1× / partie */
  getEligibleFakeTrappers() {
    const alive = this.getAlivePlayers().filter((p) => !p.fakeTrapUsed);
    if (alive.length === 0) return [];

    const minPts = Math.min(...alive.map((p) => p.points ?? 0));
    const leaders = alive.filter((p) => (p.points ?? 0) > minPts);

    if (leaders.length > 0) return leaders;

    const sorted = [...alive].sort(
      (a, b) =>
        (b.points ?? 0) - (a.points ?? 0) ||
        b.kills - a.kills ||
        b.lives - a.lives
    );
    return [sorted[0]];
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
    this.currentMinigame = pickRandomMinigame(
      this.lastMinigames.slice(-2),
      this.roundNumber
    );
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
      const eligible = this.getEligibleFakeTrappers();
      if (eligible.length === 0) {
        this.beginFakeVotePhase(broadcast);
        return;
      }
      timerSec = FAKE_SUBMIT_SEC;
    }

    this.scheduleRoundEnd(broadcast, timerSec);
    broadcast(this);
  }

  buildRoundPayload() {
    const type = this.currentMinigame;

    if (type === "memory_game") {
      const seq = getRandomMemorySequence();
      return {
        type,
        displayMs: 3000 - this.pressureLevel * 200,
        symbols: seq.symbols,
        correctOrder: seq.correctOrder,
      };
    }

    if (type === "fake_answer") {
      const prompt = pickFakeAnswerPrompt(this.usedFakePrompts);
      this.usedFakePrompts.add(prompt.id);
      const eligible = this.getEligibleFakeTrappers();

      return {
        type,
        subPhase: "submit_fake",
        question: prompt.question,
        correctAnswer: prompt.correctAnswer,
        hint:
          "Seuls les opérateurs en tête au SCORE peuvent poser 1 piège (une fois par partie).",
        eligibleTrapIds: eligible.map((p) => p.id),
        eligibleTrapNames: eligible.map((p) => p.username),
      };
    }

    const pool = getQuestionsForCategory(this.questionCategory);
    let question = pool.find((q) => !this.usedQuestions.has(q.id));
    if (!question) {
      this.usedQuestions.clear();
      question = pool[Math.floor(Math.random() * pool.length)];
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
    const correctText = payload.correctAnswer;
    const traps = [];

    for (const [authorId, text] of this.fakeAnswers.entries()) {
      const trimmed = String(text).trim().slice(0, 40);
      if (trimmed) traps.push({ text: trimmed, isCorrect: false, authorId });
    }

    const decoys = ["NEPTUNE", "1923", "BAMBOU", "ANTARCTIQUE", "PLATINE", "VENUS"];
    while (traps.length < 2) {
      traps.push({
        text: decoys[Math.floor(Math.random() * decoys.length)],
        isCorrect: false,
        authorId: null,
      });
    }

    const options = [
      { text: correctText, isCorrect: true, authorId: null },
      ...traps,
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    this._voteOptionMeta = options;

    this.roundPayload = {
      type: "fake_answer",
      subPhase: "vote",
      question: payload.question,
      options: options.map((o) => o.text),
      trapLabels: options.map((o) =>
        o.authorId ? `Piège de ${this.players.get(o.authorId)?.username}` : null
      ),
      hint: "Une seule réponse est vraie. Les autres sont des pièges.",
    };
    this.roundAnswers.clear();

    const timerSec = applyEventToTimer(FAKE_VOTE_SEC, this.activeEvent);
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
      const eligible = this.getEligibleFakeTrappers();
      if (!eligible.some((p) => p.id === socketId)) {
        return {
          error: "Pas assez de points ou piège déjà utilisé cette partie",
        };
      }
      if (this.fakeAnswers.has(socketId)) {
        return { error: "Piège déjà envoyé" };
      }
      const text = String(answer ?? "").trim().slice(0, 40);
      if (!text) return { error: "Réponse vide" };
      if (text.toUpperCase() === payload.correctAnswer?.toUpperCase()) {
        return { error: "Le piège doit être FAUX — pas la vraie réponse" };
      }

      this.fakeAnswers.set(socketId, text);
      player.fakeTrapUsed = true;

      const eligibleCount = eligible.length;
      if (this.fakeAnswers.size >= eligibleCount) {
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
    this.trappedThisRound = [];

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
      const meta = this._voteOptionMeta || [];
      for (const p of alive) {
        const ans = this.roundAnswers.get(p.id);
        const idx = ans?.answer;
        const choice = meta[idx];

        if (!ans || idx === undefined || !choice) {
          hurt(p.id, 1 * dmgMult, "Pas répondu");
          continue;
        }

        if (choice.authorId && choice.authorId !== p.id) {
          const author = this.players.get(choice.authorId);
          hurt(
            p.id,
            1 * dmgMult,
            `Piégé par ${author?.username ?? "un adversaire"}`
          );
          const after = this.players.get(p.id);
          this.trappedThisRound.push({
            playerId: p.id,
            username: p.username,
            byUsername: author?.username ?? "???",
            eliminated: after?.eliminated ?? false,
          });
          if (author && !author.eliminated) {
            this.addPoints(choice.authorId, 25);
            author.kills += 1;
            this.pushFeed({
              type: "trap",
              message: `${p.username} est tombé dans le piège de ${author.username}`,
            });
          }
        } else if (!choice.isCorrect) {
          hurt(p.id, 1 * dmgMult, "Mauvais choix");
        } else {
          p.streak = (p.streak || 0) + 1;
          this.addPoints(p.id, 15);
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
          this.addPoints(p.id, 10);
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
      this.currentMinigame = pickRandomMinigame(
        this.lastMinigames.slice(-2),
        this.roundNumber
      );
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
      if (!p.survivedMs) p.survivedMs = Date.now() - p.joinedAt;
      this.spectators.add(socketId);
      const killer = [...this.players.values()].find(
        (x) => x.id !== socketId && !x.eliminated
      );
      if (killer) killer.kills += 1;
    }
  }

  checkWinner() {
    const now = Date.now();
    for (const p of this.players.values()) {
      if (!p.survivedMs && (p.eliminated || p.lives <= 0)) {
        p.survivedMs = now - p.joinedAt;
      }
    }

    const alive = this.getAlivePlayers();
    if (alive.length === 1) {
      const w = alive[0];
      w.survivedMs = now - w.joinedAt;
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
      questionCategory: this.questionCategory,
      questionCategoryMeta: getCategoryMeta(this.questionCategory),
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
      fakeTrapEligibleIds: this.getEligibleFakeTrappers().map((p) => p.id),
      lastRoundRecap: this.lastRoundRecap,
      trappedThisRound: this.trappedThisRound,
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
      eligibleTrapIds,
      eligibleTrapNames,
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
      points: p.points || 0,
      fakeTrapUsed: p.fakeTrapUsed,
      survivedMs: p.survivedMs || 0,
    };
  }

  destroy() {
    if (this.lobbyInterval) clearInterval(this.lobbyInterval);
    this.clearRoundTimer();
  }
}

export function generateRoomCode() {
  return generateCodingRoomCode();
}
