import { getQuestionsForCategory } from "../repositories/question.repository.js";
import { isValidCategory } from "../repositories/category.repository.js";

export function listQuestions(req, res) {
  const categoryId = req.query.category || "all";
  if (!isValidCategory(categoryId)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const questions = getQuestionsForCategory(categoryId).slice(0, limit);

  res.json({
    category: categoryId,
    total: getQuestionsForCategory(categoryId).length,
    questions: questions.map(({ id, question, options, categoryId: cat }) => ({
      id,
      question,
      options,
      categoryId: cat,
    })),
  });
}
