import { Router } from "express";
import {
  listPublicRooms,
  getRoomByCode,
} from "../controllers/rooms.controller.js";

const router = Router();

router.get("/", listPublicRooms);
router.get("/:code", getRoomByCode);

export default router;
