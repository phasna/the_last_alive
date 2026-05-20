import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";
import { registerGameSockets } from "./game.socket.js";

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      ...corsOptions,
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  registerGameSockets(io);
  return io;
}
