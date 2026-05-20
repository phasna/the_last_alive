import { getCategoryStats } from "../services/questionPool.service.js";

export function listCategories(_req, res) {
  res.json({ categories: getCategoryStats() });
}
