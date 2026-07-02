# Description Technique — Application Dyslexie

---

## 1. Présentation du projet

### Objectif

L'application Dyslexie est une plateforme d'aide à l'apprentissage destinée aux élèves atteints de dyslexie. Elle combine des outils d'accessibilité avancés, de l'intelligence artificielle et des exercices adaptatifs pour réduire les obstacles liés à la lecture et à l'écriture.

### Public cible

| Profil | Rôle dans l'application |
|---|---|
| Élève dyslexique | Utilisateur principal — lecture, dictée, exercices |
| Etablissement | Tableau de bord, ajout eleve|
| Administrateur | Gestion des comptes, configuration globale |

### Problématique résolue

Les élèves dyslexiques font face à des difficultés spécifiques : confusion de lettres, lecture lente, fatigue visuelle, blocage à l'écrit. L'application adresse ces obstacles via :

- la transcription vocale en temps réel (dictée sans frappe)
- la lecture assistée avec surbrillance et synthèse vocale
- des réglages visuels adaptés (police, espacement, contraste)
- des exercices à difficulté progressive générés par IA

### Valeur ajoutée

- Aucune installation lourde côté élève — application web responsive
- Fonctionne en classe et à la maison
- Données de progression accessibles aux parents et enseignants
- Conforme RGPD pour les données de mineurs

---

## 2. Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│         React / Next.js  ·  Socket.io client               │
└────────────────────────┬────────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                     Backend NestJS                          │
│   Auth  ·  STT Gateway  ·  TTS  ·  Exercices  ·  Suivi     │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│ PostgreSQL  │ │   Redis     │ │   IA Workers    │
│ Données     │ │ Sessions /  │ │ Whisper (STT)   │
│ utilisateur │ │ Cache       │ │ Claude API(NLP) │
└─────────────┘ └────────────┘ └─────────────────┘
```

### Communication inter-services

- **REST** : authentification, gestion des profils, exercices, rapports
- **WebSocket (Socket.io)** : flux audio temps réel, transcription live, notifications
- **Processus Python** : daemon Whisper persistant, communication stdin/stdout JSON
- **Claude API** : correction orthographique, reformulation, génération d'exercices

---

## 3. Modules fonctionnels

### 3.1 Transcription vocale temps réel (STT)

Permet à l'élève de dicter à voix haute plutôt que de taper au clavier.

**Fonctionnement :**

1. Le navigateur capture l'audio via `MediaRecorder` (format WebM/Opus)
2. Les chunks audio sont envoyés toutes les 4 secondes via WebSocket
3. Le backend NestJS reçoit les chunks dans le `RealtimeSttGateway`
4. Le `RealtimeSttService` concatène les chunks avec le header WebM
5. FFmpeg convertit le buffer WebM → WAV 16kHz mono via pipe stdin
6. Le daemon Python `whisper_worker.py` reçoit le chemin WAV via stdin JSON
7. `faster-whisper` transcrit l'audio (modèle `small`, langue `fr`)
8. Le résultat JSON est renvoyé au client via `socket.emit('transcription')`

**Composants :**

| Composant | Rôle |
|---|---|
| `RealtimeSttGateway` | WebSocket Gateway NestJS — reçoit `audio_chunk`, `set_language` |
| `RealtimeSttService` | Gestion des sessions, bufferisation, orchestration |
| `WhisperProcess` | Classe daemon — spawn unique, queue de requêtes stdin/stdout |
| `whisper_worker.py` | Script Python persistant — charge le modèle une fois, boucle sur stdin |
| FFmpeg | Conversion WebM → WAV 16kHz mono via pipe (pas de fichier temporaire) |

**Optimisations clés :**

- Le modèle Whisper est chargé **une seule fois** au démarrage (gain ×5 sur la latence)
- FFmpeg lit le buffer WebM depuis `pipe:0` — supprime l'écriture d'un fichier `.webm`
- Redémarrage automatique du daemon Python en cas d'arrêt inattendu

### 3.2 Synthèse vocale (TTS)

Lecture à voix haute de tout texte affiché, avec surbrillance mot par mot.

- Utilisation de l'API Web Speech (`SpeechSynthesis`) côté navigateur
- Contrôle de la vitesse de lecture (0.5× à 2×)
- Surbrillance synchronisée mot par mot via les événements `boundary`
- Voix française sélectionnable parmi les voix système disponibles

### 3.3 Aide à la lecture

Ensemble de réglages visuels pour réduire la fatigue et la confusion.

| Réglage | Options |
|---|---|
| Police | OpenDyslexic, Arial, Verdana |
| Taille du texte | 14px → 28px |
| Espacement des lettres | Normal → Large → Très large |
| Interligne | 1.2 → 2.5 |
| Couleur de fond | Blanc, crème, bleu clair, gris clair |
| Règle de lecture | Bande horizontale suivant le curseur |
| Masque de lecture | Cache le texte non lu |

### 3.4 Correction et reformulation IA

Assistance à l'écrit pour corriger et simplifier les textes produits par l'élève.

- **Correction orthographique** : détection et suggestion de corrections sans supprimer le texte original
- **Reformulation** : simplification syntaxique via Claude API (phrases courtes, vocabulaire accessible)
- **Explication de mots** : définition illustrée au survol d'un mot difficile
- Les corrections sont proposées, jamais imposées — l'élève garde le contrôle

### 3.5 Exercices adaptatifs

Bibliothèque d'exercices générés et ajustés en fonction du niveau détecté.

**Types d'exercices :**

- Discrimination de lettres miroir (b/d, p/q)
- Reconstitution de mots à partir de syllabes
- Lecture de pseudo-mots (mesure de décodage phonologique)
- Dictée de mots avec feedback immédiat
- Compréhension de texte court avec questions

**Adaptation :**

- Le niveau est recalculé après chaque session selon le taux de réussite
- Claude API génère de nouvelles variantes pour éviter la mémorisation
- Difficulté progressive sur 5 niveaux

### 3.6 Suivi et tableau de bord

Interface de monitoring pour parents et enseignants.

- Graphique de progression par semaine et par type d'exercice
- Taux de réussite, temps moyen par exercice, erreurs récurrentes
- Export PDF du rapport de progression
- Notifications hebdomadaires par email
- Vue enseignant : comparaison anonymisée entre élèves d'une même classe

---

## 4. Stack technique

### Frontend

| Technologie | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React SSR/SSG |
| TypeScript | Typage statique |
| Tailwind CSS | Styles utilitaires |
| Socket.io client | Connexion WebSocket temps réel |
| Web Speech API | TTS natif navigateur |
| MediaRecorder API | Capture audio WebM |
| Zustand | Gestion d'état global |

### Backend

| Technologie | Usage |
|---|---|
| NestJS | Framework Node.js modulaire |
| Socket.io | Serveur WebSocket |
| PostgreSQL | Base de données relationnelle |
| Prisma ORM | Modèle de données, migrations |
| Redis | Cache sessions, file de tâches |
| Passport.js + JWT | Authentification |
| Bull | Queue de jobs asynchrones |

### IA & traitement

| Technologie | Usage |
|---|---|
| faster-whisper | Transcription vocale (modèle `small`) |
| FFmpeg | Conversion audio WebM → WAV |
| Claude API (Anthropic) | Correction, reformulation, génération |
| Python 3.12 | Runtime worker Whisper |

### Infrastructure

| Technologie | Usage |
|---|---|
| Docker + Docker Compose | Conteneurisation |
| Nginx | Reverse proxy, SSL |
| GitHub Actions | CI/CD |
| Sentry | Monitoring erreurs |

---

## 5. Modèle de données

```
User
├── id (UUID)
├── email
├── role (STUDENT | PARENT | TEACHER | ADMIN)
├── createdAt
└── profile → Profile

Profile
├── id
├── userId (FK)
├── firstName, lastName
├── birthDate
├── dyslexiaLevel (MILD | MODERATE | SEVERE)
└── preferences (JSON) ← réglages visuels, langue, police

Session (STT)
├── id
├── userId (FK)
├── startedAt, endedAt
├── language
└── transcriptions → Transcription[]

Transcription
├── id
├── sessionId (FK)
├── text
├── confidence
└── createdAt

Exercise
├── id
├── type (LETTER | WORD | SENTENCE | READING)
├── difficulty (1–5)
├── content (JSON)
└── generatedBy (STATIC | AI)

ExerciseResult
├── id
├── userId (FK)
├── exerciseId (FK)
├── score (0–100)
├── duration (ms)
├── errors (JSON)
└── completedAt

Progression
├── id
├── userId (FK)
├── week (ISO week)
├── averageScore
├── totalTime (minutes)
└── levelReached
```

---

## 6. Flux utilisateur clés

### 6.1 Dictée vocale

```
Élève clique "Démarrer la dictée"
  → MediaRecorder démarre (WebM/Opus)
  → Chunks envoyés toutes les 4s via socket.emit('audio_chunk')
  → Gateway reçoit → Service bufférise avec header WebM
  → FFmpeg pipe : WebM buffer → WAV 16kHz mono
  → WhisperProcess stdin : {"file": "/tmp/stt_xxx.wav"}
  → whisper_worker transcrit → stdout : {"text":"...", "language":"fr"}
  → socket.emit('transcription', {text}) → affichage temps réel
  → Élève clique "Arrêter" → session sauvegardée en BDD
```

### 6.2 Lecture assistée

```
Élève importe ou colle un texte
  → Application applique la police et les réglages visuels du profil
  → Élève clique "Lire"
  → SpeechSynthesis.speak() démarre
  → Événement 'boundary' → surbrillance mot courant en CSS
  → Élève peut pause / reprendre / changer la vitesse
  → Survol d'un mot difficile → Claude API → définition affichée
```

### 6.3 Exercice adaptatif

```
Élève accède à "Exercices"
  → Backend calcule le niveau courant depuis Progression
  → Si stock faible : Claude API génère 5 nouveaux exercices du niveau
  → Élève répond → score calculé instantanément
  → ExerciseResult sauvegardé
  → Algorithme recalcule le niveau → prochain exercice ajusté
  → Fin de session → mise à jour Progression → notification enseignant
```

---

## 7. Accessibilité & conformité

### Accessibilité

| Norme | Application |
|---|---|
| WCAG 2.1 niveau AA | Contraste, navigation clavier, labels ARIA |
| RGAA 4.1 | Référentiel français d'accessibilité numérique |
| Police OpenDyslexic | Disponible comme option de police |
| Navigation clavier | Tous les modules utilisables sans souris |
| Lecteur d'écran | Compatibilité NVDA, JAWS, VoiceOver |

### Conformité RGPD (données de mineurs)

- Consentement parental obligatoire à l'inscription d'un mineur
- Données de l'élève pseudonymisées dans les rapports enseignants
- Droit à l'effacement : suppression complète sur demande sous 72h
- Aucune donnée transmise à des tiers sauf Claude API (Anthropic DPA signé)
- Hébergement en Europe (OVH / Scaleway)
- Durée de conservation : données actives + 3 ans après dernière connexion
- Registre des traitements tenu à jour

---

## 8. Déploiement & configuration

### Variables d'environnement

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/dyslexie
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# IA
PYTHON_PATH=D:/Logo_pedie1/Logo_pedie/.venv/Scripts/python.exe
WHISPER_MODEL=small
WHISPER_DEVICE=cpu
WHISPER_COMPUTE=int8
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Prérequis

- Node.js ≥ 20
- Python 3.12 + virtualenv avec `faster-whisper`
- FFmpeg installé et accessible dans le PATH
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npm run start:prod

# Frontend
cd frontend
npm install
npm run build
npm start

# Worker Python (venv)
pip install faster-whisper
```

### Docker Compose

```yaml
services:
  backend:
    build: ./backend
    env_file: .env
    depends_on: [postgres, redis]
    ports: ["3000:3000"]

  frontend:
    build: ./frontend
    env_file: .env
    ports: ["3001:3001"]

  postgres:
    image: postgres:15-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
```

### Limites actuelles

- Le modèle Whisper tourne sur CPU — latence ~0.5–1s par chunk de 4s
- Pas de support hors-ligne (Internet requis pour Claude API)
- TTS dépend des voix système installées sur le navigateur

### Pistes d'amélioration

- Passage au modèle Whisper `medium` pour le français avec GPU
- Mode hors-ligne via Service Worker et modèle embarqué
- Application mobile native (React Native) pour usage tablette en classe
- Intégration ENT (Pronote, EcoleDirecte) pour import automatique des devoirs
- Analyse phonologique temps réel pendant la dictée
