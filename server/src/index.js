import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { GameManager } from "./game/GameManager.js";

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);
const isLocalOrigin = (origin) =>
  !origin ||
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, isLocalOrigin(origin)),
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 20000,
});

app.use(
  cors({
    origin: (origin, cb) => cb(null, isLocalOrigin(origin)),
  })
);
app.use(express.json());

const gameManager = new GameManager();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", game: "Last One Alive" });
});

app.get("/api/rooms", (_req, res) => {
  res.json({ rooms: gameManager.listPublicRooms() });
});

const socketRooms = new Map();

function broadcastRoom(room) {
  if (!room?.getPublicState) return;
  io.to(room.code).emit("game:state", room.getPublicState());
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ username, avatar, isPublic }, cb) => {
    const room = gameManager.createRoom(isPublic !== false);
    const result = room.addPlayer(socket.id, { username, avatar });
    if (result.error) {
      cb?.({ error: result.error });
      return;
    }
    socket.join(room.code);
    socketRooms.set(socket.id, room.code);
    room.startLobbyCountdown(io, broadcastRoom);
    cb?.({ ok: true, code: room.code, player: result.player });
    broadcastRoom(room);
  });

  socket.on("room:join", ({ code, username, avatar }, cb) => {
    const result = gameManager.joinRoom(code, socket.id, { username, avatar });
    if (result.error) {
      cb?.({ error: result.error });
      return;
    }
    const { room, player } = result;
    socket.join(room.code);
    socketRooms.set(socket.id, room.code);
    cb?.({ ok: true, code: room.code, player });
    broadcastRoom(room);
  });

  socket.on("player:ready", ({ ready }, cb) => {
    const code = socketRooms.get(socket.id);
    const room = gameManager.getRoom(code);
    if (!room) return cb?.({ error: "Not in room" });
    const p = room.setReady(socket.id, ready);
    cb?.({ ok: true, player: p });
    broadcastRoom(room);
    if (room.allReady() && room.phase === "lobby") {
      clearInterval(room.lobbyInterval);
      room.lobbyInterval = null;
      room.beginSelection(io, broadcastRoom);
    }
  });

  socket.on("game:answer", ({ answer }, cb) => {
    const code = socketRooms.get(socket.id);
    const room = gameManager.getRoom(code);
    if (!room) return cb?.({ error: "Not in room" });
    const result = room.submitAnswer(socket.id, answer);
    if (result.error) return cb?.({ error: result.error });
    if (result.resolved) {
      broadcastRoom(room);
    } else {
      io.to(code).emit("game:answered", {
        answeredCount: room.roundAnswers.size,
        total: room.getAliveCount(),
      });
    }
    cb?.({ ok: true });
  });

  socket.on("room:leave", () => {
    const code = socketRooms.get(socket.id);
    if (!code) return;
    const room = gameManager.leaveRoom(code, socket.id);
    socket.leave(code);
    socketRooms.delete(socket.id);
    if (room) broadcastRoom(room);
  });

  socket.on("disconnect", () => {
    const code = socketRooms.get(socket.id);
    if (!code) return;
    const room = gameManager.leaveRoom(code, socket.id);
    socketRooms.delete(socket.id);
    if (room) broadcastRoom(room);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🎮 Last One Alive server → http://localhost:${PORT}`);
});
