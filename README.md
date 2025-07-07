# Veevent Admin – Interface d'administration professionnelle

**Démo en ligne** :  
👉 [https://veevent-admin.vercel.app](https://veevent-admin.vercel.app)

Veevent Admin est l'interface d'administration de la plateforme Veevent, dédiée aux organisateurs et administrateurs d'événements. Elle permet de gérer l'ensemble des entités de la plateforme (événements, utilisateurs, signalements, invitations, lieux, villes, catégories, etc.) dans un environnement moderne, sécurisé, responsive et conforme aux meilleures pratiques UX/UI.

> **Note d'accès** : Pour devenir organisateur, il faut d'abord s'inscrire sur le front office Veevent ([veevent.vercel.app](https://veevent.vercel.app)), puis demander à être validé comme organisateur par un administrateur.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Accès & Rôles](#accès--rôles)
- [Installation & Configuration](#installation--configuration)
- [Authentification & Sécurité](#authentification--sécurité)
- [Structure du projet](#structure-du-projet)
- [Composants & UI](#composants--ui)
- [Pages & Flux métier](#pages--flux-métier)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Contribuer](#contribuer)
- [Contact](#contact)

---

## Fonctionnalités

- **Gestion complète des événements** : création, modification, suppression, statistiques, participants, invitations, statuts (NOT_STARTED, COMPLETED).
- **Gestion des utilisateurs** : listing, rôles, accès, statistiques, signalements, création d'organisateurs (par admin).
- **Gestion des signalements** : modération, statistiques, filtrage avancé.
- **Gestion des lieux, villes, catégories** : CRUD complet, statistiques, catégorisation.
- **Gestion des invitations** : réception, acceptation/refus, suivi des statuts.
- **Scanner de tickets** : vérification QR code (webcam) et saisie manuelle, feedback instantané.
- **Dashboard** : statistiques globales, tendances, accès rapide à toutes les entités.
- **Éditeur de texte riche** : édition limitée à H3/H4, listes, gras, italique, souligné, citation, code, liens, surlignage.
- **Personnalisation du profil** : avatar, bannière, description, réseaux sociaux, catégories d'intérêt.
- **Navigation responsive** : sidebar intelligente, gestion mobile/desktop, accessibilité.
- **Thème clair/sombre** : gestion dynamique, mémorisation du choix utilisateur.
- **Feedback utilisateur** : alertes, toasts, messages d'erreur contextualisés.

---

## Accès & Rôles

- **Rôles autorisés** : `admin`, `organizer`, `authservice` (voir src/lib/auth-roles.ts).
- **Accès à l'admin** :
  - Seuls les utilisateurs avec un rôle autorisé peuvent accéder à l'interface.
  - Pour devenir organisateur, il faut s'inscrire sur le front office puis demander la validation à un administrateur.
  - Les administrateurs peuvent promouvoir des utilisateurs au rôle d'organisateur via la page Utilisateurs.
- **Gestion des permissions** :
  - Les routes sont protégées selon le rôle (voir src/lib/route-permissions.ts).
  - Les messages d'erreur sont explicites en cas de droits insuffisants.

---

## Installation & Configuration

### Prérequis

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
npm install
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_API_URL=https://votre-backend/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BACK_URL=https://votre-backend
```

### Lancement en développement

```bash
npm run dev
```

### Lancement en production

```bash
npm start
```

---

## Authentification & Sécurité

- **Connexion** :
  - Email/mot de passe (formulaire sécurisé)
  - Google OAuth (redirection sécurisée)
- **Gestion des rôles** :
  - Vérification stricte du rôle à chaque connexion et à chaque chargement de page.
  - Redirection automatique en cas de droits insuffisants.
- **Stockage sécurisé** :
  - Token JWT en cookie HttpOnly (pour les requêtes API)
  - Infos utilisateur en localStorage (hors token)
- **Déconnexion** :
  - Bouton dédié dans la sidebar utilisateur
  - Suppression du token et des infos locales
- **Gestion des erreurs** :
  - Messages clairs pour chaque cas (connexion, droits, suppression, etc.)
  - Feedback instantané via alertes et toasts

---

## Structure du projet

```
veevent_admin/
├── public/                # Assets statiques (logos, images, icônes)
├── src/
│   ├── app/               # Pages principales (Next.js App Router)
│   ├── components/        # Composants UI réutilisables (UI, tables, dialogs, sidebar, etc.)
│   ├── hooks/             # Hooks personnalisés (auth, mobile, data)
│   ├── lib/               # Fonctions utilitaires & accès API
│   ├── types/             # Types TypeScript (Event, User, etc.)
│   ├── providers/         # Context providers (thème, auth, react-query)
│   └── ...                # Styles globaux, config, etc.
├── package.json
├── README.md
└── ...
```

---

## Composants & UI

- **UI cohérente** :
  - Boutons (`Button`), cartes (`Card`), alertes (`Alert`), badges, inputs, etc.
  - Composants modulaires, accessibles, et responsives.
- **Sidebar intelligente** :
  - Navigation principale (Dashboard, Événements, Utilisateurs, etc.)
  - Section secondaire (Profil, Paramètres, Scanner Tickets)
  - Affichage dynamique selon le rôle et la taille d'écran
- **Gestion du thème** :
  - Thème clair/sombre via provider (`ThemeProvider`)
  - Mémorisation du choix utilisateur
- **Feedback utilisateur** :
  - Alertes, toasts, messages d'erreur contextualisés
- **Éditeur de texte riche** :
  - Seuls les titres H3/H4 sont autorisés
  - Listes, gras, italique, souligné, citation, code, liens, surlignage

---

## Pages & Flux métier

- **Dashboard** : statistiques globales, tendances, accès rapide à toutes les entités.
- **Événements** : CRUD, gestion des participants, invitations, statuts, édition riche.
- **Mes événements** : vue filtrée pour les organisateurs.
- **Utilisateurs** : listing, rôles, actions rapides, création d'organisateurs.
- **Signalements** : modération, statistiques, filtrage avancé.
- **Catégories, Villes, Lieux** : gestion complète, statistiques, catégorisation.
- **Invitations** : réception, acceptation/refus, suivi des statuts.
- **Scanner Tickets** : vérification QR code (webcam) et saisie manuelle, feedback instantané.
- **Profil** : personnalisation (avatar, bannière, description, réseaux sociaux, catégories d'intérêt).
- **Paramètres** : préférences avancées (si activé).

---

## FAQ

### Comment devenir organisateur ?

- Inscrivez-vous sur le front office Veevent ([veevent.vercel.app](https://veevent.vercel.app)).
- Demandez à un administrateur de valider votre compte comme organisateur.

### Je n'arrive pas à me connecter, que faire ?

- Vérifiez vos identifiants et votre rôle.
- Si le problème persiste, contactez l'équipe Veevent.

### Le scanner de tickets ne fonctionne pas

- Autorisez l'accès à la caméra dans votre navigateur.
- Essayez de rafraîchir la page ou de changer de navigateur.

### Qui peut accéder à l'admin ?

- Seuls les utilisateurs avec le rôle `admin`, `organizer` ou `authservice`.

### Comment changer mon thème ?

- Utilisez le menu utilisateur en bas de la sidebar pour basculer entre clair et sombre.

---

## Roadmap

- Internationalisation (multi-langue)
- Export CSV/Excel des utilisateurs et événements
- Statistiques avancées et rapports personnalisés
- Notifications en temps réel (WebSocket)
- Gestion avancée des permissions par rôle
- Amélioration de l'accessibilité (a11y)

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
