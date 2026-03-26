# Documentation du processus de test (unit tests)

Ce document sert de **registre** pendant la campagne de tests unitaires automatisés.

## Comment exécuter les tests

### 1) Installer les dépendances

```bash
pip3 install -r requirements.txt
```

### 2) Lancer la suite de tests unittest

À la racine du projet :

```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
```

## Ce qui est testé

Les tests couvrent des scénarios **positifs et négatifs** sur tous les endpoints présents dans l’API :

- `/api/v1/users/`
- `/api/v1/amenities/`
- `/api/v1/places/`
- `/api/v1/places/<place_id>/reviews`
- `/api/v1/reviews/`

## Registre (endpoints, input, attendu vs réel, problèmes)

> Remplis/complète cette section si tu ajoutes des cas de test ou si tu constates un comportement différent sur ton environnement.

| Endpoint | Méthode | Données d’entrée (exemple) | Résultat attendu | Résultat réel | Problème rencontré ? |
|---|---|---|---|---|---|
| `/api/v1/users/` | POST | `{"first_name":"Jane","last_name":"Doe","email":"jane.doe@example.com"}` | 201 + JSON avec `id` | 201 | Non |
| `/api/v1/users/` | POST (email dupliqué) | même payload 2 fois | 400 + `{"error": ...}` | 400 | Non |
| `/api/v1/users/` | POST (invalid) | `{"first_name":"","last_name":"","email":"invalid"}` | 400 | 400 | Non |
| `/api/v1/users/` | GET | - | 200 + liste | 200 | Non |
| `/api/v1/users/<id>` | GET (OK) | id existant | 200 + détails user | 200 | Non |
| `/api/v1/users/<id>` | GET (KO) | id inconnu | 404 | 404 | Non |
| `/api/v1/amenities/` | POST | `{"name":"WiFi"}` | 201 + JSON avec `id` | 201 | Non |
| `/api/v1/amenities/` | POST (invalid) | `{}` | 400 | 400 | Non |
| `/api/v1/amenities/` | GET | - | 200 + liste | 200 | Non |
| `/api/v1/amenities/<id>` | GET (KO) | id inconnu | 404 | 404 | Non |
| `/api/v1/amenities/<id>` | PUT | `{"name":"Fast WiFi"}` | 200 | 200 | Non |
| `/api/v1/places/` | POST | place valide + `owner_id` | 201 + `owner_id` présent | 201 | Non |
| `/api/v1/places/` | POST (missing owner_id) | payload sans owner_id | 400 | 400 | Non |
| `/api/v1/places/` | POST (amenity KO) | amenities avec id inexistant | 400 | 400 | Non |
| `/api/v1/places/<id>` | GET (OK) | id existant | 200 + owner/amenities/reviews | 200 | Non |
| `/api/v1/places/<id>` | GET (KO) | id inconnu | 404 | 404 | Non |
| `/api/v1/places/<id>` | PUT | update description | 200 | 200 | Non |
| `/api/v1/places/<id>/reviews` | GET | place existant | 200 + liste reviews | 200 | Non |
| `/api/v1/places/<id>/reviews` | GET (KO) | place inconnu | 404 | 404 | Non |
| `/api/v1/reviews/` | POST | review valide | 201 + JSON review | 201 | Non |
| `/api/v1/reviews/` | POST (invalid) | `{"text":"..."}` | 400 | 400 | Non |
| `/api/v1/reviews/` | GET | - | 200 + liste | 200 | Non |
| `/api/v1/reviews/<id>` | GET (KO) | id inconnu | 404 | 404 | Non |
| `/api/v1/reviews/<id>` | PUT | update text/rating | 200 + JSON modifié | 200 | Non |
| `/api/v1/reviews/<id>` | DELETE | - | 200 | 200 | Non |
| `/api/v1/reviews/<id>` | DELETE (KO) | id inconnu | 404 | 404 | Non |

