# Last One Alive 💀

Jeu multijoueur en temps réel : survivez à une série de mini-jeux aléatoires jusqu’à ce qu’il ne reste qu’un survivant.

**Stack :** React (Vite + Tailwind) · Node.js · Express · Socket.io

## Démarrage rapide

```bash
# À la racine du projet
npm run install:all
npm run dev
```

- **Frontend :** http://localhost:5173  
- **Backend :** http://localhost:3001  

Ouvrez **plusieurs onglets** (ou navigateurs) pour simuler plusieurs joueurs.

## Fonctionnalités

| Écran | Description |
|-------|-------------|
| **Accueil** | Créer une room publique ou rejoindre avec un code |
| **Lobby** | Avatars, READY UP, compte à rebours |
| **Selector** | Tirage aléatoire du prochain mini-jeu |
| **Gameplay** | Quiz, Chaos Round, Memory, Sudden Death… |
| **Winner** | Podium LAST SURVIVOR, stats, récompenses |

### Mini-jeux implémentés

- **Quiz Rush** — mauvaise réponse = -1 vie  
- **Last Answer Loses** — le dernier à répondre perd une vie  
- **Chaos Round** — réponses qui bougent / disparaissent  
- **Sudden Death** — une erreur = élimination  
- **Memory Game** — mémoriser une séquence de symboles  

### Règles

- Chaque joueur commence avec **3 vies** ❤️❤️❤️  
- Minimum **2 joueurs** pour lancer une partie  
- Pression qui monte : timer plus court, effets plus agressifs  
- Éliminé → mode spectateur  

## Structure du projet

```
├── client/          # React + Vite + Tailwind + Framer Motion
│   └── src/
│       ├── screens/   # Home, Lobby, Selector, Gameplay, Winner
│       ├── components/
│       └── hooks/     # useSocket
└── server/          # Node.js + Socket.io
    └── src/game/    # Room, GameManager, mini-jeux
```

## Variables d’environnement (optionnel)

```env
# client/.env
VITE_SOCKET_URL=http://localhost:3001

# server
PORT=3001
```

## Prochaines étapes possibles

- Fake Answer (inventer une fausse réponse)  
- Sons & musique d’ambiance  
- Auth / profils persistants (XP, badges)  
- Rooms privées listées via API  
- Déploiement (Render, Railway, Vercel + VPS)

---

Inspiré par *Alice in Borderland*, *Squid Game* et l’esthétique cyberpunk survival arena.
# the_last_alive
