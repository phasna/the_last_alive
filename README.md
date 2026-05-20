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

## Jouer sur le réseau local (host / LAN)

Pour que des amis sur le **même Wi‑Fi** rejoignent depuis leur téléphone ou PC :

```bash
npm run dev:host
```

Le terminal affiche une adresse du type :

```text
→ http://192.168.1.42:5173
```

**Sur ton Mac**, envoie ce lien aux autres joueurs. Tout le monde utilise la **même URL** (pas `localhost`).

| Qui | URL à utiliser |
|-----|----------------|
| Toi (sur le Mac qui lance le serveur) | `http://localhost:5173` ou l’IP affichée |
| Amis (même Wi‑Fi) | `http://192.168.x.x:5173` (l’IP affichée dans le terminal) |

**Si ça ne marche pas :**

1. Mac : **Réglages Système → Réseau → Pare-feu** — autoriser Node ou désactiver temporairement pour tester  
2. Vérifier que tout le monde est sur le **même réseau Wi‑Fi** (pas invité isolé)  
3. Relancer avec `npm run dev:host` (pas seulement `npm run dev`)

## Fonctionnalités

| Écran | Description |
|-------|-------------|
| **Accueil** | Créer une room publique ou rejoindre avec un code |
| **Lobby** | Avatars, READY UP, compte à rebours |
| **Selector** | Tirage aléatoire du prochain mini-jeu |
| **Gameplay** | Quiz, Chaos Round, Memory, Sudden Death… |
| **Winner** | Podium LAST SURVIVOR, stats, récompenses |

### Mini-jeux (6)

- **Quiz Rush** — mauvaise réponse = -1 vie  
- **Last Answer Loses** — le dernier à répondre perd une vie  
- **Chaos Round** — réponses qui bougent / disparaissent  
- **Sudden Death** — une erreur = élimination  
- **Memory Game** — mémoriser une séquence de symboles  
- **Fake Answer** — invente un piège, puis devine la vraie réponse  

### Nouveautés gameplay

- **Événements d’arène** aléatoires (Timer Crush, Blackout, Double Damage, Final Countdown)  
- **Feed de combat** en temps réel (dégâts, éliminations)  
- **Récap de manche** après chaque round  
- **Sons synthétiques** (ready, tick, dégâts, élimination, victoire)  
- **Streak** de bonnes réponses affiché en jeu  
- **Bouton COPIER** le code room dans le lobby  

### Règles

- Chaque joueur commence avec **3 vies** ❤️❤️❤️  
- Minimum **2 joueurs** pour lancer une partie  
- Pression qui monte : timer plus court, effets plus agressifs  
- Éliminé → mode spectateur  

## Structure du projet

```
├── client/          # React + Vite + Tailwind + Framer Motion
│   └── src/
└── server/          # Express + Socket.io
    └── src/
        ├── app.js           # App Express
        ├── index.js         # Point d’entrée HTTP
        ├── routes/          # Routes REST /api/*
        ├── controllers/     # Logique HTTP
        ├── socket/          # Événements temps réel
        ├── services/        # GameManager partagé
        └── game/            # Room, mini-jeux
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
