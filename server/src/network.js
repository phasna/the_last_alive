import os from "os";

export function getLanAddresses() {
  const ips = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const cfg of iface ?? []) {
      if (cfg.family === "IPv4" && !cfg.internal) {
        ips.push(cfg.address);
      }
    }
  }
  return [...new Set(ips)];
}

export function printServerUrls(port) {
  console.log(`🎮 Last One Alive — API + Socket.io`);
  console.log(`   Local:   http://localhost:${port}`);
  for (const ip of getLanAddresses()) {
    console.log(`   Réseau:  http://${ip}:${port}`);
  }
}

export function printHostInstructions(clientPort = 5173) {
  console.log(`\n📱 Pour jouer depuis un autre appareil (même Wi‑Fi):`);
  for (const ip of getLanAddresses()) {
    console.log(`   → http://${ip}:${clientPort}`);
  }
  if (getLanAddresses().length === 0) {
    console.log(`   (aucune IP réseau détectée — vérifie ta connexion Wi‑Fi)`);
  }
  console.log(`\n   Lance avec: npm run dev:host\n`);
}
