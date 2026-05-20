import { Room, generateRoomCode } from "./Room.js";

export class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(isPublic = true) {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }
    const room = new Room(code, isPublic);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code?.toUpperCase());
  }

  joinRoom(code, socketId, profile) {
    const room = this.getRoom(code);
    if (!room) return { error: "Room not found" };
    const result = room.addPlayer(socketId, profile);
    if (result.error) return result;
    return { room, player: result.player };
  }

  leaveRoom(code, socketId) {
    const room = this.getRoom(code);
    if (!room) return;
    room.removePlayer(socketId);
    if (room.players.size === 0) {
      room.destroy();
      this.rooms.delete(code);
    }
    return room;
  }

  listPublicRooms() {
    return [...this.rooms.values()]
      .filter((r) => r.isPublic && r.phase === "lobby")
      .map((r) => ({
        code: r.code,
        players: r.players.size,
        maxPlayers: 16,
      }));
  }
}
