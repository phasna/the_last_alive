import {
  gameManager,
  socketRooms,
  broadcastRoom,
  getRoomBySocket,
} from "../services/game.service.js";

export function registerGameSockets(io) {
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
      room.startLobbyCountdown(io, (r) => broadcastRoom(io, r));
      cb?.({ ok: true, code: room.code, player: result.player });
      broadcastRoom(io, room);
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
      broadcastRoom(io, room);
    });

    socket.on("player:ready", ({ ready }, cb) => {
      const room = getRoomBySocket(socket.id);
      if (!room) return cb?.({ error: "Not in room" });
      const p = room.setReady(socket.id, ready);
      cb?.({ ok: true, player: p });
      broadcastRoom(io, room);
      if (room.allReady() && room.phase === "lobby") {
        clearInterval(room.lobbyInterval);
        room.lobbyInterval = null;
        room.beginSelection(io, (r) => broadcastRoom(io, r));
      }
    });

    socket.on("game:answer", ({ answer }, cb) => {
      const code = socketRooms.get(socket.id);
      const room = gameManager.getRoom(code);
      if (!room) return cb?.({ error: "Not in room" });
      const result = room.submitAnswer(socket.id, answer);
      if (result.error) return cb?.({ error: result.error });
      if (result.resolved || result.phaseChange) {
        broadcastRoom(io, room);
      } else {
        broadcastRoom(io, room);
        io.to(code).emit("game:answered", {
          answeredCount: room.roundAnswers.size,
          fakeSubmittedCount: room.fakeAnswers.size,
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
      if (room) broadcastRoom(io, room);
    });

    socket.on("disconnect", () => {
      const code = socketRooms.get(socket.id);
      if (!code) return;
      const room = gameManager.leaveRoom(code, socket.id);
      socketRooms.delete(socket.id);
      if (room) broadcastRoom(io, room);
    });
  });
}
