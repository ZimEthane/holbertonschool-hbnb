# Guide d'Utilisation - Scripts SQL HBNB

## Vue d'ensemble

Guide d'utilisation 

---

## Fichiers Disponibles

| Fichier | Description |
|---------|-------------|
| `00_reset_database.sql` | **Supprime toutes les tables** - À utiliser avec prudence |
| `01_create_tables.sql` | Crée la structure complète des tables |
| `02_insert_initial_data.sql` | Insère les données initiales (admin + commodités) |
| `03_verify_database.sql` | Vérifie que tout est correctement configuré |
| `init_tables.sql` | Script complet (crée tables + insère données) |
| `README.md` | Documentation technique complète |
| `SCHEMA.md` | Diagramme du schéma et relations |

---

## Scénarios d'Utilisation

### Scénario 1 : Initialisation Première Fois (Recommandé)

**Une seule commande pour initialiser complètement** :

```bash
mysql -u root -p hbnb_database < init_tables.sql
```

Ou si vous êtes déjà connecté à MySQL :

```sql
SOURCE init_tables.sql;
```

---

### Scénario 2 : Initialisation Progressive

Si vous préférez contrôler chaque étape :

#### Étape 1 : Créer les tables
```bash
mysql -u root -p hbnb_database < 01_create_tables.sql
```

#### Étape 2 : Insérer les données initiales
```bash
mysql -u root -p hbnb_database < 02_insert_initial_data.sql
```

#### Étape 3 : Vérifier la configuration
```bash
mysql -u root -p hbnb_database < 03_verify_database.sql
```

---

### Scénario 3 : Réinitialiser la Base de Données

**Attention : Cela supprime TOUTES les données**

```bash
mysql -u root -p hbnb_database < 00_reset_database.sql
mysql -u root -p hbnb_database < init_tables.sql
```

---

## Exemples d'Utilisation

### Option 1 : Ligne de Commande (Terminal)

#### Se connecter à MySQL
```bash
mysql -u root -p
```

#### Créer la base de données (si elle n'existe pas)
```sql
CREATE DATABASE IF NOT EXISTS hbnb_database;
USE hbnb_database;
```

#### Exécuter les scripts
```sql
SOURCE /path/to/sql/init_tables.sql;
```

### Option 2 : MySQL Workbench

1. Ouvrir MySQL Workbench
2. Se connecter au serveur MySQL
3. File → Open SQL Script → Sélectionner `init_tables.sql`
4. Exécuter (bouton Execute)

### Option 3 : Docker

Si vous utilisez MySQL en Docker :

```bash
docker exec -i container_name mysql -u root -p database_name < init_tables.sql
```

---

## Vérification Après Initialisation

Pour vérifier que tout fonctionne correctement :

```bash
mysql -u root -p hbnb_database < 03_verify_database.sql
```

### Résultats attendus :

1. ✓ 5 tables créées : `users`, `places`, `reviews`, `amenities`, `place_amenity`
2. ✓ 1 utilisateur administrateur
3. ✓ 3 commodités initiales
4. ✓ Toutes les constraintes appliquées
5. ✓ Tous les index créés

---

## Données Initiales

### Admin User

```
Email:    admin@hbnb.io
Mot de passe: admin1234
ID:       36c9050e-ddd3-4c3b-9731-9f487208bbc1
Status:   Admin ✓
```

### Commodités Initiales

1. **WiFi** - ID: 550e8400-e29b-41d4-a716-446655440001
2. **Piscine** - ID: 550e8400-e29b-41d4-a716-446655440002
3. **Climatisation** - ID: 550e8400-e29b-41d4-a716-446655440003

---

## Requêtes Utiles

### Vérifier les utilisateurs existants
```sql
SELECT id, first_name, last_name, email, is_admin FROM users;
```

### Voir toutes les commodités
```sql
SELECT * FROM amenities;
```

### Vérifier les places créées
```sql
SELECT id, title, price, owner_id FROM places;
```

### Voir les avis d'une location
```sql
SELECT r.id, r.text, r.rating, u.first_name
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE r.place_id = 'place-uuid-here';
```

### Ajouter une nouvelle commodité
```sql
INSERT INTO amenities (id, name, created_at, updated_at)
VALUES (UUID(), 'Netflix', NOW(), NOW());
```

### Créer un nouvel utilisateur
```sql
INSERT INTO users (id, first_name, last_name, email, password, is_admin)
VALUES (UUID(), 'John', 'Doe', 'john@example.com', 'hashed_password_here', FALSE);
```

---

## Résolution des Problèmes

### Erreur : "Access denied for user"
- Vérifiez vos credentials MySQL
- Assurez-vous d'utiliser le bon utilisateur et mot de passe

### Erreur : "Database does not exist"
- Créez d'abord la base de données :
  ```sql
  CREATE DATABASE hbnb_database;
  ```

### Erreur : "Duplicate entry for key"
- Cela peut arriver si les données ont déjà été insérées
- Réinitialisez avec `00_reset_database.sql`

### Erreur : "Foreign key constraint fails"
- L'ordre d'insertion est incorrect
- Assurez-vous d'exécuter d'abord `01_create_tables.sql`

---

## Configuration MySQL Recommandée

Pour les environnements de développement, assurez-vous que :

```sql
-- Vérifier le charset
SHOW VARIABLES LIKE 'character_set_%';

-- Recommandé : UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

---

## Synchronisation avec SQLAlchemy

Les scripts SQL créent les mêmes structures que les modèles SQLAlchemy dans :
- `/part3/hbnb/app/models/user.py`
- `/part3/hbnb/app/models/place.py`
- `/part3/hbnb/app/models/review.py`
- `/part3/hbnb/app/models/amenity.py`

Les deux approches sont synchronisées et compatibles.

---

## Notes Important

1. **UUID Format** : Tous les `id` utilisent le format UUID (36 caractères)
2. **Mot de passe** : Le mot de passe admin est haché en bcrypt
3. **Cascading Delete** : Les suppressions en base sont automatiques et cohérentes
4. **Timestamps** : Gérés automatiquement par la base de données
5. **Encoding** : UTF-8 soutenances tous les caractères spéciaux

---

## Support et Contact

Pour plus d'aide :
- Consultez `README.md` pour la documentation technique
- Consultez `SCHEMA.md` pour le diagramme des relations
- Vérifiez les modèles SQLAlchemy pour la logique métier

---

## Bonnes Pratiques

**À FAIRE :**
- Exécuter les scripts dans l'ordre numérique
- Vérifier les résultats avec `03_verify_database.sql`
- Conserver les scripts dans le dépôt Git
- Documenter les modifications de schéma

**À ÉVITER :**
- Modifier directement les tables sans scripts
- Réinitialiser en production
- Ignorer les erreurs de constraint
- Utiliser des IDs en dur au lieu des UUID

---

## Ressources Supplémentaires

- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Guide SQLAlchemy](https://docs.sqlalchemy.org/)
- [UUID Format RFC 4122](https://tools.ietf.org/html/rfc4122)
- [Documentation Bcrypt](https://github.com/pyca/bcrypt)

---

**Dernière mise à jour** : 2026-03-18
**Version** : 1.0
