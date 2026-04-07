# HBNB - Part 4 : Frontend

Interface web moderne et responsive pour la plateforme HBNB (clone d'Airbnb).

## Fonctionnalités

### Pages Utilisateur
- **Accueil** (index.html) - Affichage de toutes les locations avec filtrage et recherche
- **Mes Avis** (my-reviews.html) - Gestion des avis laissés (créer, modifier, supprimer)
- **Mes Locations** (my-places.html) - Gestion des locations (CRUD complet)
  - Modal pour ajouter une nouvelle location
  - Sélection de localisation via carte interactive (Leaflet + OpenStreetMap)
  - Upload d'images (jusqu'à 6 par location)
  - Gestion des aménités
- **Détails d'une Location** (place.html) - Vue détaillée avec avis et localisation
- **Ajouter un Avis** (add_review.html) - Formulaire pour laisser un avis

### Authentification
- **Inscription** (register.html) - Création de compte utilisateur
- **Connexion** (login.html) - Authentification via token JWT
- **Profil Utilisateur** (user-profile.html) - Gestion du profil (avatar, informations)

### Dashboard Admin
- **Tableau de Bord** (admin-dashboard.html) - Vue d'ensemble statistiques
- **Gestion des Aménités** (admin-amenities.html) - CRUD des aménités

### Autres
- **Aide** (about.html) - Page d'aide et informations

## Structure du Projet

```
part4/hbnb/frontend/
├── *.html                 → Pages HTML (11 pages)
├── js/
│   ├── common.js         → Fonctions partagées (API, affichage)
│   ├── hamburger.js      → Menu mobile
│   ├── index.js          → Logique page d'accueil
│   ├── login.js          → Logique connexion
│   ├── register.js       → Logique inscription
│   ├── my-places.js      → CRUD locations + map
│   ├── my-reviews.js     → CRUD avis
│   ├── add-review.js     → Ajout avis
│   ├── place.js          → Détail d'une location
│   ├── user-profile.js   → Profil utilisateur
│   ├── admin-dashboard.js → Dashboard admin
│   └── admin-amenities.js → Gestion aménités
├── css/
│   └── styles.css        → Styles personnalisés (si nécessaire)
└── images/
    ├── logo.png
    └── icon.png
```

## Technologie Frontend

- **HTML5** - Structure sémantique
- **Tailwind CSS** - Framework CSS utilitaire (via CDN @tailwindcss/browser)
- **JavaScript** - Logique côté client
- **Leaflet.js** - Cartes interactives
- **OpenStreetMap** - Service de géolocalisation
- **SweetAlert2** - Notifications et modales
- **Fetch API** - Communication avec le backend

## Intégration Backend

Le frontend communique avec l'API backend via des appels Fetch :

- **Base URL** : http://localhost:5000/api/v1 (développement)
- **Authentification** : Token JWT stocké en localStorage
- **Endpoints principaux** :
  - /places - CRUD locations
  - /reviews - CRUD avis
  - /amenities - Liste des aménités
  - /users - Gestion utilisateurs
  - /auth - Inscription/connexion

## Caractéristiques UI/UX

### Design Moderne
- Interface épurée et intuitive
- Palette de couleurs cohérente (rouge/gris)
- Responsive design (mobile, tablet, desktop)
- Smooth transitions et animations

### Composants Interactifs
- **Modales** - Ajout/modification de locations et avis
- **Cartes Interactives** - Sélection de localisation avec Leaflet
- **Filtres** - Tri par note, recherche par text
- **Upload d'Images** - Aperçu en grid et suppression
- **Menu Mobile** - Hamburger menu responsive

### Gestion des Données
- Stocker le token et l'ID utilisateur en localStorage
- Validation côté client
- Gestion d'erreurs avec SweetAlert2
- Redirection automatique si non authentifié

## Installation & Démarrage

### Prérequis
- Backend HBNB en cours d'exécution sur http://localhost:5000
- Serveur web local (ou utiliser python -m http.server)

### Lancer le Frontend

**Option 1 : Python HTTP Server**
```bash
cd part4/hbnb/frontend
python -m http.server 8000
```
Accéder à : http://localhost:8000

**Option 2 : Node.js HTTP Server**
```bash
cd part4/hbnb/frontend
npx http-server
```

**Option 3 : Live Server (VS Code)**
Installer l'extension "Live Server" et cliquer "Go Live"

## Points Clés du Code

### Authentification
- Token JWT récupéré depuis le backend
- Stocké en localStorage pour la session
- Inclus dans chaque requête API via l'en-tête Authorization: Bearer <token>

### Gestion de la Carte
- Initialisation lazy (seulement au besoin)
- Nettoyage des ressources après utilisation
- Support du clic sur la carte pour sélectionner une localisation
- Recherche par adresse via Nominatim (OpenStreetMap)

### Upload d'Images
- Conversion en base64 pour transmission
- Validation de taille et format
- Limite de 6 images par location
- Aperçu immédiat avec option de suppression

### Modales & Formulaires
- Modal pour ajout de locations (au lieu d'inline)
- Modal unifié pour édition (locations et avis)
- Nettoyage automatique des formulaires
- Validation côté client avant soumission

## Scripts Actuellement Disponibles

Chaque fichier JS correspond à une page :
- Gère les événements utilisateur
- Effectue les appels API
- Met à jour le DOM
- Affiche les notifications

## Résolution des Problèmes

### La page ne charge pas
- Vérifier que le backend est démarré
- Vérifier la console du navigateur (F12)

### Les images n'affichent pas
- Vérifier qu'elles sont en base64
- Vérifier l'en-tête Authorization

### Impossible de créer une location
- Vérifier les coordonnées GPS
- S'assurer d'être authentifié

## Ressources

- [Leaflet Documentation](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [SweetAlert2](https://sweetalert2.github.io/)

---

Dernière mise à jour : Avril 2026
Statut : Production Ready

