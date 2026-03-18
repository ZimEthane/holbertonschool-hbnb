# HBNB Database Initialization Scripts

Scripts SQL pour initialiser la base de données HBNB avec schéma et données initiales.

## Description

Ce dossier contient les scripts SQL pour :
- Créer la structure complète de la base de données
- Insérer les données initiales (utilisateur admin et commodités)

## Fichiers Script

### 1. `init_tables.sql`
Script complet qui crée toutes les tables et insère les données initiales en une seule exécution.
- **Utilisation** : Exécution unique pour initialiser la base complète

### 2. `01_create_tables.sql`
Script de création de toutes les tables de la base de données.
- **Utilisation** : Exécuter en premier

### 3. `02_insert_initial_data.sql`
Script d'insertion des données initiales.
- **Utilisation** : Exécuter après `01_create_tables.sql`

## Structure des Tables

### `users`
| Colonne | Type | Description |
|---------|------|-------------|
| id | CHAR(36) | UUID format - Clé primaire |
| first_name | VARCHAR(255) | Prénom de l'utilisateur |
| last_name | VARCHAR(255) | Nom de l'utilisateur |
| email | VARCHAR(255) | Email unique de l'utilisateur |
| password | VARCHAR(255) | Mot de passe haché (bcrypt) |
| is_admin | BOOLEAN | Indicateur d'administrateur |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Date de dernière modification |

### `places`
| Colonne | Type | Description |
|---------|------|-------------|
| id | CHAR(36) | UUID format - Clé primaire |
| title | VARCHAR(255) | Titre de l'annonce |
| description | TEXT | Description du lieu |
| price | DECIMAL(10,2) | Prix par nuit |
| latitude | FLOAT | Latitude géographique |
| longitude | FLOAT | Longitude géographique |
| owner_id | CHAR(36) | FK vers users(id) |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Date de dernière modification |

### `reviews`
| Colonne | Type | Description |
|---------|------|-------------|
| id | CHAR(36) | UUID format - Clé primaire |
| text | TEXT | Contenu de l'évaluation |
| rating | INT | Note de 1 à 5 |
| user_id | CHAR(36) | FK vers users(id) |
| place_id | CHAR(36) | FK vers places(id) |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Date de dernière modification |

**Contraintes** :
- `rating` : Entre 1 et 5 (CHECK)
- `(user_id, place_id)` : UNIQUE (Un seul avis par utilisateur par location)

### `amenities`
| Colonne | Type | Description |
|---------|------|-------------|
| id | CHAR(36) | UUID format - Clé primaire |
| name | VARCHAR(255) | Nom unique de la commodité |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Date de dernière modification |

### `place_amenity` (Relation Many-to-Many)
| Colonne | Type | Description |
|---------|------|-------------|
| place_id | CHAR(36) | FK vers places(id) |
| amenity_id | CHAR(36) | FK vers amenities(id) |

**Clé Primaire Composite** : (place_id, amenity_id)

## Données Initiales

### Admin User
```
ID: 36c9050e-ddd3-4c3b-9731-9f487208bbc1
Email: admin@hbnb.io
Prénom: Admin
Nom: HBnB
Mot de passe: admin1234 (haché en bcrypt)
Is Admin: True
```

### Commodités Initiales
1. **WiFi** - ID: 550e8400-e29b-41d4-a716-446655440001
2. **Piscine** - ID: 550e8400-e29b-41d4-a716-446655440002
3. **Climatisation** - ID: 550e8400-e29b-41d4-a716-446655440003

## Mode d'Utilisation

### Option 1 : Initialisation Complète
Exécuter le script unique pour initialiser toute la base :

```bash
mysql -u username -p database_name < init_tables.sql
```

### Option 2 : Initialisation Progressive
#### Étape 1 : Créer les tables
```bash
mysql -u username -p database_name < 01_create_tables.sql
```

#### Étape 2 : Insérer les données initiales
```bash
mysql -u username -p database_name < 02_insert_initial_data.sql
```

### Option 3 : Exécution depuis MySQL CLI
```bash
mysql> SOURCE init_tables.sql;
```

Ou séparément :
```bash
mysql> SOURCE 01_create_tables.sql;
mysql> SOURCE 02_insert_initial_data.sql;
```

## Contraintes et Validations

### Clés Étrangères
- **places.owner_id** → users(id) - CASCADE DELETE
- **reviews.user_id** → users(id) - CASCADE DELETE
- **reviews.place_id** → places(id) - CASCADE DELETE
- **place_amenity.place_id** → places(id) - CASCADE DELETE
- **place_amenity.amenity_id** → amenities(id) - CASCADE DELETE

### Contraintes Uniques
- users.email
- amenities.name
- reviews.(user_id, place_id) - Une seule évaluation par utilisateur par location

### Index
- places.owner_id
- reviews.user_id
- reviews.place_id
- place_amenity.amenity_id

## Notes Importantes

1. **UUID Format** : Tous les ID utilisent le format UUID (CHAR(36))
2. **Timestamps** : created_at et updated_at sont automatiquement gérés par la base de données
3. **Mot de passe** : Le mot de passe admin est haché en bcrypt (`$2b$12$RJk3aShbZhUWO5bw7uW80.fV74R.amtr3dFpTU9GQr7U/QiwPDDyO`)
4. **Charset** : UTF-8 par défaut pour supporter les caractères spéciaux
5. **Encoding** : CollationUTF-8 Unicode généralisée

## 🔄 Réinitialisation de la Base

Pour réinitialiser complètement la base de données :

```sql
DROP TABLE IF EXISTS place_amenity;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS users;
```

Puis réexécuter les scripts d'initialisation.

## Support

Pour plus d'informations sur la structure, consultez les fichiers modèles SQLAlchemy :
- `/part3/hbnb/app/models/user.py`
- `/part3/hbnb/app/models/place.py`
- `/part3/hbnb/app/models/review.py`
- `/part3/hbnb/app/models/amenity.py`
