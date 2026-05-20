import { getConnectionLabel } from "../db/config.js";
import { countQuestions } from "../repositories/question.repository.js";
import { getCategoryStats } from "../repositories/category.repository.js";

export function getHealth(_req, res) {
  res.json({
    status: "ok",
    game: "Last One Alive",
    stack: "Express + Socket.io + MySQL",
    database: {
      engine: "MySQL",
      connection: getConnectionLabel(),
      questions: countQuestions("all"),
      categories: getCategoryStats().length,
    },
  });
}
