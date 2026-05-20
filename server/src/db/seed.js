import { QUIZ_QUESTIONS, MEMORY_SEQUENCES } from "../data/questions.js";
import { FAKE_ANSWER_PROMPTS } from "../data/fakeAnswerPrompts.js";
import { detectCategory } from "./detectCategory.js";

const CATEGORIES = [
  {
    id: "all",
    label: "TOUT MÉLANGER",
    icon: "🎲",
    description: "Toutes les questions du pool",
    sort_order: 0,
    is_virtual: 1,
  },
  {
    id: "geo",
    label: "GÉOGRAPHIE",
    icon: "🌍",
    description: "Pays, capitales, continents",
    sort_order: 1,
    is_virtual: 0,
  },
  {
    id: "science",
    label: "SCIENCES",
    icon: "🔬",
    description: "Chimie, physique, nature",
    sort_order: 2,
    is_virtual: 0,
  },
  {
    id: "sport",
    label: "SPORT",
    icon: "⚽",
    description: "Sports et compétitions",
    sort_order: 3,
    is_virtual: 0,
  },
  {
    id: "culture",
    label: "CULTURE",
    icon: "🎭",
    description: "Art, cinéma, littérature",
    sort_order: 4,
    is_virtual: 0,
  },
  {
    id: "history",
    label: "HISTOIRE",
    icon: "📜",
    description: "Dates et événements",
    sort_order: 5,
    is_virtual: 0,
  },
  {
    id: "general",
    label: "GÉNÉRAL",
    icon: "🧠",
    description: "Culture générale variée",
    sort_order: 6,
    is_virtual: 0,
  },
];

export async function needsSeed(pool) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS n FROM quiz_questions"
  );
  return Number(rows[0].n) === 0;
}

export async function seedDatabase(pool) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const cat of CATEGORIES) {
      await conn.query(
        `INSERT INTO categories (id, label, icon, description, sort_order, is_virtual)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           icon = VALUES(icon),
           description = VALUES(description),
           sort_order = VALUES(sort_order),
           is_virtual = VALUES(is_virtual)`,
        [
          cat.id,
          cat.label,
          cat.icon,
          cat.description,
          cat.sort_order,
          cat.is_virtual,
        ]
      );
    }

    for (const q of QUIZ_QUESTIONS) {
      await conn.query(
        `INSERT INTO quiz_questions (id, question, options, correct_index, category_id)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           question = VALUES(question),
           options = VALUES(options),
           correct_index = VALUES(correct_index),
           category_id = VALUES(category_id)`,
        [
          q.id,
          q.question,
          JSON.stringify(q.options),
          q.correctIndex,
          detectCategory(q.question),
        ]
      );
    }

    await conn.query("DELETE FROM memory_sequences");
    for (const seq of MEMORY_SEQUENCES) {
      await conn.query(
        `INSERT INTO memory_sequences (symbols, correct_order) VALUES (?, ?)`,
        [JSON.stringify(seq.symbols), JSON.stringify(seq.correctOrder)]
      );
    }

    for (const p of FAKE_ANSWER_PROMPTS) {
      await conn.query(
        `INSERT INTO fake_answer_prompts (id, question, correct_answer)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           question = VALUES(question),
           correct_answer = VALUES(correct_answer)`,
        [p.id, p.question, p.correctAnswer]
      );
    }

    await conn.commit();

    const [counts] = await conn.query(
      `SELECT category_id, COUNT(*) AS n FROM quiz_questions GROUP BY category_id`
    );

    return {
      questions: QUIZ_QUESTIONS.length,
      memory: MEMORY_SEQUENCES.length,
      fakePrompts: FAKE_ANSWER_PROMPTS.length,
      byCategory: Object.fromEntries(
        counts.map((r) => [r.category_id, Number(r.n)])
      ),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
