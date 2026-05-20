import { getConnectionLabel } from "../db/config.js";
import { getPool } from "../db/index.js";
import { getCategoryStats } from "../repositories/category.repository.js";

const TABLE_NAMES = [
  "categories",
  "quiz_questions",
  "memory_sequences",
  "fake_answer_prompts",
];

export async function getDatabaseInfo(_req, res) {
  try {
    const pool = getPool();
    const counts = {};

    for (const table of TABLE_NAMES) {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS n FROM \`${table}\``
      );
      counts[table] = Number(rows[0].n);
    }

    res.json({
      engine: "MySQL",
      connection: getConnectionLabel(),
      tables: TABLE_NAMES,
      counts,
      categories: getCategoryStats(),
      hint: "Utilise phpMyAdmin, MySQL Workbench ou npm run db:status",
    });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
}
