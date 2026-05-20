import { GameManager } from "../game/GameManager.js";

/** Instance unique du gestionnaire de parties (partagée API + Socket.io) */
export const gameManager = new GameManager();

/** socket.id → code de room */
export const socketRooms = new Map();

export function broadcastRoom(io, room) {
  if (!room?.getPublicState) return;
  io.to(room.code).emit("game:state", room.getPublicState());
}

export function getRoomBySocket(socketId) {
  const code = socketRooms.get(socketId);
  return gameManager.getRoom(code);
}
