import { createServer } from "http";
import { createApp } from "./app.js";
import { initDatabase } from "./db/index.js";
import { createSocketServer } from "./socket/index.js";
import { printServerUrls, printHostInstructions } from "./network.js";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

async function main() {
  try {
    await initDatabase();
  } catch (err) {
    console.error("\n[db] Impossible de se connecter à MySQL :");
    console.error(`   ${err.message}`);
    console.error("\n   Vérifie server/.env (copie depuis .env.example)");
    console.error("   MySQL doit être démarré (MAMP, XAMPP, Docker, etc.)\n");
    process.exit(1);
  }

  const app = createApp();
  const httpServer = createServer(app);

  createSocketServer(httpServer);

  httpServer.listen(PORT, HOST, () => {
    printServerUrls(PORT);
    if (process.env.SHOW_HOST_HELP === "1") {
      printHostInstructions(5173);
    }
  });
}

main();
