#!/usr/bin/env node
import { initDatabase, getConnectionLabel, closeDatabase } from "../src/db/index.js";
import { getPool } from "../src/db/index.js";
import { getCategoryStats } from "../src/repositories/category.repository.js";

const TABLES = [
  "categories",
  "quiz_questions",
  "memory_sequences",
  "fake_answer_prompts",
];

await initDatabase();
const pool = getPool();

console.log("\n📦 Base MySQL — Last One Alive\n");
console.log("   Connexion :", getConnectionLabel());
console.log("");

for (const table of TABLES) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
  console.log(`   ${table.padEnd(22)} ${rows[0].n} lignes`);
}

console.log("\n   Catégories (questions) :");
for (const c of getCategoryStats()) {
  console.log(`   ${c.icon} ${c.label.padEnd(16)} ${c.count}`);
}
console.log("");

await closeDatabase();
