import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getMysqlConfig, getConnectionLabel } from "./config.js";
import { SCHEMA_STATEMENTS } from "./schema.js";
import { needsSeed, seedDatabase } from "./seed.js";
import { refreshCache } from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

let pool = null;

export function getPool() {
  if (!pool) {
    throw new Error("MySQL non initialisé. Appelle initDatabase() d'abord.");
  }
  return pool;
}

export function getDbPath() {
  return getConnectionLabel();
}

/** @deprecated Utilise getPool() — conservé pour compat scripts */
export function getDb() {
  return getPool();
}

async function ensureDatabaseExists() {
  const { database, ...base } = getMysqlConfig();
  const conn = await mysql.createConnection(base);
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();
}

async function runSchema(p) {
  for (const sql of SCHEMA_STATEMENTS) {
    try {
      await p.query(sql);
    } catch (err) {
      if (err.code !== "ER_DUP_KEYNAME") throw err;
    }
  }
}

export async function initDatabase() {
  if (pool) return pool;

  await ensureDatabaseExists();

  pool = mysql.createPool({
    ...getMysqlConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
  });

  await runSchema(pool);

  if (await needsSeed(pool)) {
    const stats = await seedDatabase(pool);
    console.log(
      `[db] MySQL seed OK — ${stats.questions} questions, ${stats.memory} memory, ${stats.fakePrompts} fake prompts`
    );
  }

  await refreshCache(pool);
  console.log(`[db] MySQL connecté → ${getConnectionLabel()}`);

  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
