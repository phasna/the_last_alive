/** Cache mémoire — lectures synchrones pour le gameplay Socket.io */
let categories = [];
let categoryStats = [];
let questionsByCategory = new Map();
let allQuestions = [];
let memorySequences = [];
let fakeAnswerPrompts = [];

function parseJson(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function isCacheReady() {
  return allQuestions.length > 0;
}

export async function refreshCache(pool) {
  const [catRows] = await pool.query(
    `SELECT id, label, icon, description, sort_order, is_virtual
     FROM categories ORDER BY sort_order ASC`
  );

  const [questionRows] = await pool.query(
    `SELECT id, question, options, correct_index, category_id
     FROM quiz_questions ORDER BY id ASC`
  );

  const [memoryRows] = await pool.query(
    `SELECT id, symbols, correct_order FROM memory_sequences`
  );

  const [fakeRows] = await pool.query(
    `SELECT id, question, correct_answer FROM fake_answer_prompts`
  );

  categories = catRows;
  allQuestions = questionRows.map((row) => ({
    id: row.id,
    question: row.question,
    options: parseJson(row.options, []),
    correctIndex: row.correct_index,
    categoryId: row.category_id,
  }));

  questionsByCategory = new Map();
  for (const q of allQuestions) {
    if (!questionsByCategory.has(q.categoryId)) {
      questionsByCategory.set(q.categoryId, []);
    }
    questionsByCategory.get(q.categoryId).push(q);
  }

  const total = allQuestions.length;
  const countMap = {};
  for (const q of allQuestions) {
    countMap[q.categoryId] = (countMap[q.categoryId] || 0) + 1;
  }

  categoryStats = catRows.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    description: c.description,
    count: c.is_virtual ? total : countMap[c.id] ?? 0,
  }));

  memorySequences = memoryRows.map((row) => ({
    id: row.id,
    symbols: parseJson(row.symbols, []),
    correctOrder: parseJson(row.correct_order, []),
  }));

  fakeAnswerPrompts = fakeRows.map((row) => ({
    id: row.id,
    question: row.question,
    correctAnswer: row.correct_answer,
  }));
}

export function getCachedCategories() {
  return categories.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    description: c.description,
  }));
}

export function getCachedCategoryMeta(id) {
  const row = categories.find((c) => c.id === id);
  if (row) {
    return {
      id: row.id,
      label: row.label,
      icon: row.icon,
      description: row.description,
    };
  }
  const fallback = categories.find((c) => c.id === "all");
  return (
    fallback && {
      id: fallback.id,
      label: fallback.label,
      icon: fallback.icon,
      description: fallback.description,
    }
  ) ?? {
    id: "all",
    label: "TOUT MÉLANGER",
    icon: "🎲",
    description: "Toutes les questions du pool",
  };
}

export function isCachedCategoryValid(id) {
  return categories.some((c) => c.id === id);
}

export function getCachedCategoryStats() {
  return categoryStats;
}

export function getCachedQuestionsForCategory(categoryId = "all") {
  if (!categoryId || categoryId === "all") {
    return [...allQuestions];
  }
  const pool = questionsByCategory.get(categoryId) ?? [];
  return pool.length > 0 ? [...pool] : [...allQuestions];
}

export function getCachedQuestionCount(categoryId = "all") {
  if (!categoryId || categoryId === "all") return allQuestions.length;
  return questionsByCategory.get(categoryId)?.length ?? 0;
}

export function getCachedMemorySequences() {
  return memorySequences;
}

export function getCachedFakeAnswerPrompts() {
  return fakeAnswerPrompts;
}
