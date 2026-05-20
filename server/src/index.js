import { createServer } from "http";
import { createApp } from "./app.js";
import { createSocketServer } from "./socket/index.js";
import { printServerUrls, printHostInstructions } from "./network.js";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(PORT, HOST, () => {
  printServerUrls(PORT);
  if (process.env.SHOW_HOST_HELP === "1") {
    printHostInstructions(5173);
  }
});
