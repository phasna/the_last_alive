import {
  getCachedCategories,
  getCachedCategoryMeta,
  isCachedCategoryValid,
  getCachedCategoryStats,
} from "../db/cache.js";

export function getAllCategories() {
  return getCachedCategories();
}

export function getCategoryMeta(id) {
  return getCachedCategoryMeta(id);
}

export function isValidCategory(id) {
  return isCachedCategoryValid(id);
}

export function getCategoryStats() {
  return getCachedCategoryStats();
}
