#!/usr/bin/env node
import { initDatabase, closeDatabase } from "../src/db/index.js";
import { getPool } from "../src/db/index.js";
import { needsSeed, seedDatabase } from "../src/db/seed.js";
import { refreshCache } from "../src/db/cache.js";

await initDatabase();
const pool = getPool();

if (!(await needsSeed(pool))) {
  console.log("[db] Des questions existent déjà — seed ignoré.");
  console.log("[db] Pour tout réimporter : TRUNCATE quiz_questions; puis npm run db:seed");
} else {
  const stats = await seedDatabase(pool);
  await refreshCache(pool);
  console.log("[db] Seed MySQL terminé");
  console.log(stats);
}

await closeDatabase();
