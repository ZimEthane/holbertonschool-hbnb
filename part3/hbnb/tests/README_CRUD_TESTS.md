# 🧪 Guide de Test CRUD - HBNB Database

## Vue d'ensemble

Ce guide vous explique comment tester les opérations CRUD (Create, Read, Update, Delete) sur votre base de données HBNB Part 3.

---

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.12+
- Flask et SQLAlchemy installés
- La base de données SQLite initialisée

### Exécution du Test Complet

```bash
cd /workspaces/holbertonschool-hbnb/part3/hbnb
python tests/test_crud_operations.py
```

### Résultat Attendu
- ✅ Plus de 95% de réussite
- 📊 Rapport détaillé avec statistiques
- 📋 Détails de chaque opération testée

---

## 📋 Qu'est-ce qui est Testé?

### 1️⃣ **Table USER**
Opérations CRUD complètes sur les utilisateurs

| Opération | Test |
|---|---|
| **CREATE** | Création d'utilisateurs avec email unique |
| **READ** | Récupération par ID, email, et requête complète |
| **UPDATE** | Modification des noms |
| **DELETE** | Suppression avec vérification |

**Données testées:**
- `first_name`, `last_name` (validation longueur)
- `email` (validation unicité)
- `password` (hachage avec bcrypt)
- `is_admin` (boolean)
- `created_at`, `updated_at` (timestamps)

---

### 2️⃣ **Table AMENITY**
Équipements et services

| Opération | Test |
|---|---|
| **CREATE** | Création de 8 équipements différents |
| **READ** | Récupération par nom et complète |
| **UPDATE** | Modification du nom |
| **DELETE** | Suppression |

**Équipements testés:**
```
- WiFi
- Climatisation
- Piscine
- Parking
- Cuisine
- Lave-vaisselle
- Télévision
- Chauffage
```

---

### 3️⃣ **Table PLACE**
Lieux de location

| Opération | Test |
|---|---|
| **CREATE** | Création de 2 lieux avec propriétaire |
| **READ** | Récupération par ID |
| **UPDATE** | Modification prix et description |
| **DELETE** | Suppression |

**Données testées:**
- `title` (validation longueur)
- `description` (optionnel)
- `price` (validation positive)
- `latitude` (validation -90 à 90)
- `longitude` (validation -180 à 180)
- `owner_id` (relation User)

---

### 4️⃣ **Table PLACE_AMENITY**
Relation Many-to-Many

| Opération | Test |
|---|---|
| **CREATE** | Liaison de 4 équipements à un lieu |
| **READ** | Récupération des équipements |
| **UPDATE** | Ajout d'équipements |
| **DELETE** | Suppression d'équipements |

---

### 5️⃣ **Table REVIEW**
Avis sur les lieux

| Opération | Test |
|---|---|
| **CREATE** | Création d'avis avec notes |
| **READ** | Récupération par ID |
| **UPDATE** | Modification note et texte |
| **DELETE** | Suppression |

**Données testées:**
- `text` (validation non-vide)
- `rating` (validation 1-5)
- `user_id` (relation User)
- `place_id` (relation Place)

---

## 🔗 Tests des Relations

### One-to-Many: User → Place
```python
user.places  # Liste de tous les lieux de l'utilisateur
```

### One-to-Many: Place → Review
```python
place.reviews  # Liste de tous les avis du lieu
```

### Many-to-Many: Place ↔ Amenity
```python
place.amenities     # Tous les équipements du lieu
amenity.places      # Tous les lieux avec cet équipement
```

---

## 🛡️ Tests des Contraintes

### Unicité (UNIQUE)
```
Test: Tenter de créer 2 utilisateurs avec le même email
Résultat: ✅ La 2e création est rejetée
```

### Validation des valeurs (CHECK)
```
Test: Tenter une note de 10 (doit être 1-5)
Résultat: ✅ Rejeté au niveau du modèle
```

### Intégrité référentielle (FOREIGN KEY)
```
Test: Tenter de créer un lieu sans propriétaire
Résultat: ✅ Rejeté (NOT NULL)
```

---

## 📊 Interprétation des Résultats

### Format de Sortie

```
======================================================================
  1. OPÉRATIONS CRUD - USER
======================================================================

>>> CREATE - Créer des utilisateurs
  ✓ PASS: Créer utilisateur 1
         ID: 83c0b209-1eb0-46d9-8e09-d745e9a5a16d
```

- **✓ PASS**: Test réussi
- **✗ FAIL**: Test échoué
- Chaque opération a un statut et un message

### Résumé Final

```
  Total des tests: 37
  ✓ Réussis: 36
  ✗ Échoués: 1
  Taux de réussite: 97.3%
```

---

## 🔧 Dépannage

### Erreur: "Database not found"
```bash
# Solution: Réinitialiser la base de données
cd part3/hbnb
python
>>> from app import create_app
>>> app = create_app()
>>> with app.app_context():
>>>     from app.extensions import db
>>>     db.create_all()
```

### Erreur: "LegacyAPIWarning"
- C'est un avertissement SQLAlchemy, pas une erreur
- Peut être ignoré en production
- À mettre à jour pour SQLAlchemy 2.0+ (optionnel)

### Erreur: "IntegrityError"
- Vérifiez les contraintes UNIQUE
- Vérifiez les valeurs NOT NULL
- Vérifiez les validations du modèle

---

## 🎯 Cas d'Utilisation

### 1. Tester après modifications de modèle
```bash
# Modifiez un modèle (ex: User)
# Puis relancez le test
python tests/test_crud_operations.py
```

### 2. Développement continu
```bash
# Ajoutez vos propres tests à la classe CRUDTester
# Les tests sont modulaires et faciles à adapter
```

### 3. CI/CD Pipeline
```bash
# Le script peut être intégré à votre pipeline
# Le taux de réussite peut être utilisé comme métrique
python tests/test_crud_operations.py > test_results.txt
```

---

## 📝 Structure du Script

Le fichier `test_crud_operations.py` contient:

```python
class CRUDTester:
    # Méthodes de test principales
    - run_all_tests()           # Exécute tous les tests
    - _reset_database()         # Réinitialise la BD
    - _test_user_crud()         # Tests USER
    - _test_amenity_crud()      # Tests AMENITY
    - _test_place_crud()        # Tests PLACE
    - _test_place_amenity_crud() # Tests M2M
    - _test_review_crud()       # Tests REVIEW
    - _test_relationships()     # Tests relations
    - _test_constraints()       # Tests contraintes
    - _print_summary()          # Résumé final
```

---

## 💡 Conseils Pratiques

### 1. Lancer les tests avant le déploiement
```bash
python tests/test_crud_operations.py && echo "✓ OK"
```

### 2. Vérifier la base de données SQLite
```bash
sqlite3 instance/development.db
sqlite> .tables
sqlite> SELECT COUNT(*) FROM user;
```

### 3. Adapter les tests à vos besoins
- Modifiez les données de test
- Ajoutez de nouveaux tests
- Intégrez avec vos tests unitaires

---

## 📚 Ressources

- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Flask-SQLAlchemy**: https://flask-sqlalchemy.palletsprojects.com/
- **SQLite**: https://www.sqlite.org/

---

## 🆘 Support

Si vous rencontrez des problèmes:

1. **Vérifiez les logs**: Lisez le message d'erreur complètement
2. **Testez isolément**: Testez chaque opération CRUD séparément
3. **Validez les données**: Vérifiez que les données respectent les contraintes
4. **Réinitialisez**: En dernier recours, réinitialisez la base de données

---

## 📊 Rapport Détaillé

Pour un rapport plus détaillé, consultez: `CRUD_TEST_REPORT.md`

Ce fichier contient:
- Résultats détaillés par table
- Statistiques complètes
- Observations et recommandations
- Conclusion et prochaines étapes

---

### ✨ Bon testing!
