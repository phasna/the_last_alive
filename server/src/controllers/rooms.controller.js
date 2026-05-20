import { gameManager } from "../services/game.service.js";

export function listPublicRooms(_req, res) {
  res.json({ rooms: gameManager.listPublicRooms() });
}

export function getRoomByCode(req, res) {
  const room = gameManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json({ room: room.getPublicState() });
}
