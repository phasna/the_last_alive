import {
  getCachedQuestionsForCategory,
  getCachedQuestionCount,
} from "../db/cache.js";

export function getQuestionsForCategory(categoryId = "all") {
  return getCachedQuestionsForCategory(categoryId);
}

export function countQuestions(categoryId = "all") {
  return getCachedQuestionCount(categoryId);
}
