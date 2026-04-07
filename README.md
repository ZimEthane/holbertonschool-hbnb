# Holbertonschool-hbnb

Clone simplifié de AirBnB développé dans le cadre de la formation Holberton School.

## Vue d'Ensemble Globale

Ce projet est divisé en **4 parties** :

| Partie | Domaine | Description |
|--------|---------|------------|
| **Part 1** | Conception | UML, diagrammes, architecture |
| **Part 2** | Backend API | Flask, REST API, routes CRUD |
| **Part 3** | Base de Données | MySQL/SQLite, schéma, persistance |
| **Part 4** | Frontend Web | HTML/CSS/JS, interface utilisateur |

## Architecture Complète

```
Frontend (Part 4)
    ↓
Fetch API (HTTP)
    ↓
Backend API (Part 2)
    ↓
Services / Facade
    ↓
Models
    ↓
Persistence Layer
    ↓
Database (Part 3)
```

### Application organisée en couches :

- **Frontend** : Interface web responsive (Tailwind CSS, vanilla JS)
- **API** : REST endpoints (Flask)
- **Services / Facade** : Logique métier
- **Models** : Entités métier
- **Persistence** : Stockage en base de données


## Part 1 — Conception (Part1)

Dans cette première partie, nous avons travaillé sur la conception du projet.
Création des diagrammes UML (classes, séquences, architecture).
Définition des entités principales : User, Place, Review, Amenity, etc.
Organisation de l’architecture en différentes couches.
Préparation de la structure technique avant le développement.
But : comprendre la modélisation d’une application complexe avant son implémentation.

## Part 2 — API / Backend (Part2)

Dans cette seconde partie, nous avons développé le backend avec Flask.
Mise en place d’une API REST.
Implémentation des routes CRUD (Create, Read, Update, Delete).
Gestion des modèles et de la persistance des données.
Architecture propre (API → Services → Models → Storage).
But : construire la logique serveur de l’application.

## Part 3 — Base de Données (Part3)

Dans cette troisième partie, nous intégrons une base de données pour la persistance des données.
Création des scripts SQL pour initialiser la base de données.
Schéma complet avec 5 tables : User, Place, Review, Amenity, Place_Amenity.
Support de **MySQL** (production) et **SQLite** (développement local).
Relations correctement définies avec clés étrangères et contraintes uniques.
Données initiales : Admin user + 3 Amenities (WiFi, Piscine, Climatisation).
But : passer de la mémoire vive à la persistance en base de données réelle.

### Structure SQL
```bash
part3/hbnb/sql/
├── init_database.sql          → Création des tables (MySQL)
├── insert_data.sql            → Données initiales (MySQL)
├── init_database_sqlite.sql   → Création des tables (SQLite)
├── insert_data_sqlite.sql     → Données initiales (SQLite)
└── README_SQLITE.md           → Documentation SQLite
```

## Part 4 — Frontend / Interface Web (Part4)

Dans cette quatrième partie, nous développons l'interface web moderne et responsive.
Interface utilisateur complète avec HTML5, Tailwind CSS et JavaScript vanilla.
Gestion complète des locations et avis en temps réel (CRUD).
Authentification JWT intégrée.
Cartes interactives (Leaflet + OpenStreetMap) pour la sélection de localisation.
Upload d'images avec aperçu en temps réel.
Design responsive adapté mobile, tablet et desktop.
Dashboard admin pour la gestion des aménités.
But : créer une interface web professionnelle et intuitive pour interagir avec l'API.

### Structure Frontend
```bash
part4/hbnb/frontend/
├── *.html                 → 11 pages HTML
│   ├── index.html         • Page d'accueil (toutes les locations)
│   ├── login.html         • Connexion utilisateur
│   ├── register.html      • Inscription
│   ├── my-places.html     • Gestion des locations
│   ├── my-reviews.html    • Gestion des avis
│   ├── place.html         • Détail d'une location
│   ├── add_review.html    • Ajout d'avis
│   ├── user-profile.html  • Profil utilisateur
│   ├── admin-dashboard.html    • Dashboard admin
│   ├── admin-amenities.html    • Gestion aménités
│   └── about.html         • Page d'aide
├── js/                    → Scripts JavaScript
│   ├── common.js          • Fonctions partagées
│   ├── index.js           • Page d'accueil
│   ├── my-places.js       • CRUD locations + map
│   ├── my-reviews.js      • CRUD avis
│   └── ... (8 autres scripts)
└── images/                → Assets (logo, icônes)
```

### Fonctionnalités Part 4
- CRUD complet : Locations et avis
- Authentification JWT : Login, register, token storage
- Cartes interactives : Leaflet + OpenStreetMap
- Upload d'images : Base64, limite 6 images
- Modales élégantes : Ajout/modification avec animations
- Design responsive : Mobile-first, Tailwind CSS
- Validation côté client : Avant soumission API
- Gestion d'erreurs : SweetAlert2 notifications


## Installation Complète

### 1 - Cloner le dépôt
```bash
git clone https://github.com/ZimEthane/holbertonschool-hbnb.git
cd holbertonschool-hbnb
```

### 2 - Backend - Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3 - Backend - Initialiser la Base de Données

**MySQL (Production)**
```bash
cd part3/hbnb/sql
mysql -u username -p database < init_database.sql
mysql -u username -p database < insert_data.sql
```

**SQLite (Développement Local)**
```bash
cd part3/hbnb/sql
sqlite3 hbnb.db < init_database_sqlite.sql
sqlite3 hbnb.db < insert_data_sqlite.sql
```

### 4 - Lancer le Backend
```bash
# Depuis la racine du projet
flask run
# L’API sera disponible sur http://localhost:5000
```

### 5 - Lancer le Frontend
Ouvrir un nouveau terminal :
```bash
cd part4/hbnb/frontend
python -m http.server 8000
# Accéder à http://localhost:8000
```

## Configuration Quick Start

```bash
# Terminal 1 - Backend
pip install -r requirements.txt
flask run
# API sur http://localhost:5000

# Terminal 2 - Frontend
cd part4/hbnb/frontend
python -m http.server 8000
# Frontend sur http://localhost:8000
```

## Comptes de Test

Après l’initialisation de la base de données :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user123 |

_Les mots de passe exacts dépendent de vos scripts d’initialisation_

## Documentation Détaillée

- **Part1** : Voir README dans `part1/` (diagrammes UML)
- **Part2** : Voir README dans `part2/` (API REST)
- **Part3** : Voir `part3/hbnb/sql/README_SQLITE.md` (base de données)
- **Part4** : Voir `part4/README.md` (frontend)

## Technologie Globale

| Couche | Technologie |
|--------|------------|
| **Frontend** | HTML5, Tailwind CSS, JavaScript vanilla |
| **Backend** | Flask, Python |
| **Database** | MySQL / SQLite |
| **API** | REST, JSON |
| **Auth** | JWT (JSON Web Tokens) |
| **Maps** | Leaflet.js + OpenStreetMap |

## Résolution des Problèmes

### Le frontend ne peut pas se connecter au backend
- Vérifier que le backend est démarré sur `http://localhost:5000`
- Vérifier les logs Flask pour les erreurs
- Vérifier la console du navigateur (F12)

### Erreur 404 sur les fichiers statiques du frontend
- S’assurer que le serveur HTTP est lancé dans le bon répertoire
- Vérifier que tu es dans `part4/hbnb/frontend` avant de lancer le serveur

### Base de données ne fonctionne pas
- Vérifier les identifiants MySQL
- S’assurer que MySQL/SQLite est installé
- Vérifier les fichiers `.sql` existent

## Support

Pour toute question sur le projet ou les parties spécifiques, consulte les READMEs individuels dans chaque dossier part*/.

---

Statut du Projet : Complet (4 parties)
Dernière mise à jour : Avril 2026
Auteur : Ethane Zim @ Holberton School

