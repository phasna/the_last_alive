import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import apiRoutes from "./routes/index.js";

/**
 * Application Express — routes REST sous /api
 */
export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use("/api", apiRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      error: "Not found",
      hint: "API disponible sur /api/health et /api/rooms",
    });
  });

  return app;
}
