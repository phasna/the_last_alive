import { Router } from "express";
import { getDatabaseInfo } from "../controllers/database.controller.js";

const router = Router();

router.get("/", (req, res, next) => {
  getDatabaseInfo(req, res).catch(next);
});

export default router;
