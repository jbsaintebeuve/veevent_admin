# Veevent Admin – Interface d'administration

**Démo en ligne** :  
👉 [https://veevent-admin.vercel.app](https://veevent-admin.vercel.app)

**Veevent Admin** est l'interface d'administration de la plateforme Veevent, destinée aux organisateurs et administrateurs. Elle permet de gérer les événements, utilisateurs, signalements, invitations, lieux, villes, catégories, et bien plus, dans un environnement moderne, sécurisé et responsive.

---

## Sommaire

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Structure du projet](#structure-du-projet)
- [Installation & Lancement](#installation--lancement)
- [Authentification & Sécurité](#authentification--sécurité)
- [Composants & Pages clés](#composants--pages-clés)
- [Développement & Personnalisation](#développement--personnalisation)
- [FAQ](#faq)
- [Améliorations futures](#améliorations-futures)
- [Contribuer](#contribuer)
- [Contact](#contact)

---

## Fonctionnalités principales

- **Gestion des événements** : création, modification, suppression, statistiques, participants, invitations.
- **Gestion des utilisateurs** : listing, rôles, accès, signalements.
- **Gestion des signalements** : modération, statistiques, filtrage.
- **Gestion des lieux, villes, catégories** : CRUD complet.
- **Scanner de tickets** : vérification QR code et saisie manuelle.
- **Tableaux interactifs** : tri, recherche, pagination, actions rapides.
- **Dashboard** : statistiques globales, tendances, accès rapide.
- **Authentification sécurisée** : login classique et Google OAuth, gestion des rôles.
- **Responsive** : expérience optimisée desktop et mobile.
- **Thème clair/sombre** : gestion dynamique via context provider.

---

## Structure du projet

```
veevent_admin/
├── public/                # Assets statiques (logos, images, icônes)
├── src/
│   ├── app/               # Pages principales (Next.js App Router)
│   │   ├── dashboard/     # Dashboard & statistiques
│   │   ├── events/        # Gestion des événements
│   │   ├── users/         # Gestion des utilisateurs
│   │   ├── reports/       # Signalements
│   │   ├── places/        # Lieux
│   │   ├── cities/        # Villes
│   │   ├── categories/    # Catégories
│   │   ├── invitations/   # Invitations
│   │   ├── scan/          # Scanner de tickets
│   │   ├── profile/       # Profil utilisateur
│   │   ├── auth/          # Authentification (login, callback)
│   │   └── ...            # Autres pages (not-found, layout, etc.)
│   ├── components/        # Composants UI réutilisables
│   │   ├── ui/            # Briques UI (Button, Card, Table, etc.)
│   │   ├── tables/        # Tableaux de données (users, events, etc.)
│   │   ├── dialogs/       # Dialogues contextuels
│   │   ├── create-dialogs/# Dialogues de création (event, place, etc.)
│   │   ├── modify-dialogs/# Dialogues de modification
│   │   └── ...            # Sidebar, Header, Navigation, etc.
│   ├── hooks/             # Hooks personnalisés (auth, mobile, data)
│   ├── lib/               # Fonctions utilitaires & accès API
│   ├── types/             # Types TypeScript (Event, User, etc.)
│   ├── providers/         # Context providers (thème, auth)
│   └── ...                # Styles globaux, config, etc.
├── package.json
├── README.md
└── ...
```

---

## Installation & Lancement

### Prérequis

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
npm install
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine avec :

```
NEXT_PUBLIC_API_URL=https://votre-backend/api         # URL de l'API backend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000        # URL du frontend (utilisé pour les callbacks OAuth)
NEXT_PUBLIC_BACK_URL=https://votre-backend            # URL racine du backend (pour OAuth, etc.)
```

### Lancement en développement

```bash
npm run dev
```

### Lancement en production

```bash
npm start
```

## Authentification & Sécurité

- **Connexion classique** (email/mot de passe) et via **Google OAuth**.
- **Gestion des rôles** : seuls les administrateurs et organisateurs accèdent à l'admin.
- **Stockage sécurisé** du token (cookie HttpOnly) et des infos utilisateur (localStorage).
- **Déconnexion automatique** si le token est invalide ou expiré.
- **Redirections sécurisées** selon le rôle et l'état de connexion.

---

## Composants & Pages clés

### Pages principales (`src/app/`)

- **Dashboard** : Statistiques globales, tendances, accès rapide.
- **Événements** : CRUD, participants, invitations, édition riche (éditeur custom).
- **Utilisateurs** : Listing, rôles, actions rapides.
- **Signalements** : Modération, statistiques, filtrage.
- **Scanner** : Vérification QR code, saisie manuelle, feedback instantané.
- **Profil** : Gestion des infos personnelles, avatar, préférences.
- **Paramètres** : (si activé) gestion des préférences avancées.

### Composants UI (`src/components/ui/`)

- **Button, Card, Table, Input, Select, Alert, Badge, etc.**
- **Sidebar** : navigation responsive, gestion mobile/desktop.
- **Dialogs** : création/modification d'entités, confirmations.
- **NovelEditor** : éditeur riche limité à H3/H4, listes, gras, italique, etc.
- **QRScanner** : scan de tickets via webcam.

### Hooks personnalisés (`src/hooks/`)

- **useAuth** : gestion du contexte utilisateur, token, rôles.
- **useMobile** : détection du mode mobile.
- **useEventParticipants, useEnrichedInvitations** : data hooks spécialisés.

### Accès API & utilitaires (`src/lib/`)

- **fetch-xxx.ts** : accès aux endpoints backend (events, users, reports, etc.)
- **upload-image.ts** : upload Cloudinary.
- **route-permissions.ts** : gestion centralisée des droits d'accès.

### Types TypeScript (`src/types/`)

- **Event, User, Report, Place, City, Category, Invitation, Ticket** : typage strict de toutes les entités.

---

## Développement & Personnalisation

- **Composants modulaires** : chaque entité (event, user, etc.) a ses propres dialogues, tables, hooks.
- **Thème clair/sombre** : personnalisable via le provider.
- **Extensible** : ajoutez facilement de nouveaux modules/pages via le pattern existant.
- **UI/UX** : design moderne, cohérent, accessible, optimisé mobile.

---

## FAQ

### Je n'arrive pas à me connecter, que faire ?

- Vérifiez que vos identifiants sont corrects et que vous avez le bon rôle (organisateur ou administrateur).
- Si le problème persiste, contactez l'équipe Veevent.

### Comment ajouter un nouvel organisateur ?

- Seuls les administrateurs peuvent créer de nouveaux comptes organisateur via la page Utilisateurs.

### Le scanner de tickets ne fonctionne pas sur mon appareil

- Vérifiez que vous avez autorisé l'accès à la caméra dans votre navigateur.
- Essayez de rafraîchir la page ou de changer de navigateur.

---

## Améliorations futures

- Ajout d'un mode multi-langue (internationalisation)
- Export CSV/Excel des utilisateurs et événements
- Statistiques avancées et rapports personnalisés
- Notifications en temps réel (WebSocket)
- Gestion avancée des permissions par rôle

---

## Contribuer

1. Forkez le repo
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'feat: ma feature'`)
4. Pushez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## Contact

Pour toute question ou contribution, contactez l'équipe Veevent ou ouvrez une issue sur le repo.
