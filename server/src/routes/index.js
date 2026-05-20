import { Router } from "express";
import healthRoutes from "./health.routes.js";
import roomsRoutes from "./rooms.routes.js";
import categoriesRoutes from "./categories.routes.js";
import questionsRoutes from "./questions.routes.js";
import databaseRoutes from "./database.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/rooms", roomsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/questions", questionsRoutes);
router.use("/database", databaseRoutes);

export default router;
