# Holbertonschool-hbnb

Clone simplifié de AirBnB développé dans le cadre de la formation Holberton School.

## Application organisée en couches :

- API
- Services / Facade
- Models
- Persistence

## 🧱 Partie 1 — Conception (Part1)

Dans cette première partie, nous avons travaillé sur la conception du projet.
Création des diagrammes UML (classes, séquences, architecture).
Définition des entités principales : User, Place, Review, Amenity, etc.
Organisation de l’architecture en différentes couches.
Préparation de la structure technique avant le développement.
But : comprendre la modélisation d’une application complexe avant son implémentation.

## 🌐 Partie 2 — API / Backend (Part2)

Dans cette seconde partie, nous avons développé le backend avec Flask.
Mise en place d’une API REST.
Implémentation des routes CRUD (Create, Read, Update, Delete).
Gestion des modèles et de la persistance des données.
Architecture propre (API → Services → Models → Storage).
But : construire la logique serveur de l’application.

## 💾 Partie 3 — Base de Données (Part3)

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

## 🛠️ Installation
Cloner le dépôt
```bash
git clone https://github.com/ZimEthane/holbertonschool-hbnb.git
```

Installer les dépendances
```bash
pip install -r requirements.txt
```

Lancer l’API
```bash
flask run
```

## 🗄️ Initialiser la Base de Données

### MySQL (Production)
```bash
cd part3/hbnb/sql
mysql -u username -p database < init_database.sql
mysql -u username -p database < insert_data.sql
```

### SQLite (Développement Local)
```bash
cd part3/hbnb/sql
sqlite3 hbnb.db < init_database_sqlite.sql
sqlite3 hbnb.db < insert_data_sqlite.sql
```
