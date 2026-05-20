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

## Base de données (MySQL)

Les **questions**, **catégories**, **séquences mémoire** et **prompts Fake Answer** sont dans **MySQL**.

### Configuration

1. Démarre MySQL (MAMP, XAMPP, Docker, MySQL local…).
2. Copie la config :

```bash
cp server/.env.example server/.env
```

3. Édite `server/.env` (utilisateur, mot de passe, nom de base) :

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=ton_mot_de_passe
MYSQL_DATABASE=last_one_alive
```

4. Lance le projet — la base et les tables sont créées automatiquement, puis les 323 questions sont importées au premier démarrage.

**Voir les données :** phpMyAdmin, MySQL Workbench, DBeaver, ou :

```bash
npm run db:status
```

Avec le serveur : [http://localhost:3001/api/database](http://localhost:3001/api/database)

Schéma SQL manuel : `server/sql/schema.sql`

| Table | Contenu |
|-------|---------|
| `categories` | Catégories du lobby |
| `quiz_questions` | QCM + `category_id` |
| `memory_sequences` | Memory game |
| `fake_answer_prompts` | Mode piège |

**API :** `/api/categories` · `/api/questions?category=geo` · `/api/health` · `/api/database`

## Structure du projet

```
├── client/          # React + Vite + Tailwind + Framer Motion
│   └── src/
└── server/          # Express + Socket.io + MySQL
    ├── sql/         # schema.sql
    ├── .env         # config MySQL (non versionné)
    └── src/
        ├── app.js
        ├── index.js
        ├── db/              # MySQL, seed, cache
        ├── repositories/    # Accès données
        ├── routes/
        ├── controllers/
        ├── socket/
        ├── services/
        └── game/
```

## Variables d’environnement (optionnel)

```env
# client/.env
VITE_SOCKET_URL=http://localhost:3001

# server/.env
PORT=3001
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=last_one_alive
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
