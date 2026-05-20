import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool1 } from "./quiz-pool-1.mjs";
import { pool2 } from "./quiz-pool-2.mjs";
import { pool3 } from "./quiz-pool-3.mjs";
import { pool4 } from "./quiz-pool-4.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "../server/src/data/questions.js");

const MEMORY = `export const MEMORY_SEQUENCES = [
  { symbols: ["◆", "▲", "●", "■"], correctOrder: [0, 2, 1, 3] },
  { symbols: ["★", "◎", "▽", "⬡"], correctOrder: [1, 0, 3, 2] },
  { symbols: ["⬢", "◉", "▣", "◇"], correctOrder: [2, 0, 3, 1] },
  { symbols: ["♠", "♥", "♦", "♣"], correctOrder: [3, 1, 0, 2] },
  { symbols: ["☀", "☽", "★", "☁"], correctOrder: [2, 3, 0, 1] },
  { symbols: ["①", "②", "③", "④"], correctOrder: [1, 3, 0, 2] },
  { symbols: ["🔴", "🟢", "🔵", "🟡"], correctOrder: [2, 1, 3, 0] },
  { symbols: ["α", "β", "γ", "δ"], correctOrder: [0, 3, 2, 1] },
];
`;

const all = [...pool1, ...pool2, ...pool3, ...pool4];
if (all.length < 200) {
  console.error(`Seulement ${all.length} questions, il en faut au moins 200.`);
  process.exit(1);
}

const items = all
  .map(
    ([question, options, correctIndex], i) => `  {
    id: "q${i + 1}",
    question: ${JSON.stringify(question)},
    options: ${JSON.stringify(options)},
    correctIndex: ${correctIndex},
  }`
  )
  .join(",\n");

const js = `export const QUIZ_QUESTIONS = [\n${items},\n];\n\n${MEMORY}\n`;
writeFileSync(out, js, "utf8");
console.log(`Écrit ${all.length} questions → ${out}`);
