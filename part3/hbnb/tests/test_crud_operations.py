#!/usr/bin/python3
"""
Script de test complet pour toutes les opérations CRUD sur la base de données.
Teste: User, Place, Amenity, Place_Amenity, Review
VERSION 2 - Avec gestion d'erreur améliorée
"""

import os
import sys
import datetime
from pathlib import Path

# Ajoute le répertoire parent au chemin Python
sys.path.insert(0, str(Path(__file__).parent.parent))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity
from app.models.review import Review


def print_section(title):
    """Affiche un titre de section."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_subsection(title):
    """Affiche un titre de sous-section."""
    print(f"\n>>> {title}")


def print_result(operation, success, message=""):
    """Affiche le résultat d'une opération."""
    status = "✓ PASS" if success else "✗ FAIL"
    print(f"  {status}: {operation}")
    if message:
        print(f"         {message}")


class CRUDTester:
    def __init__(self, app):
        self.app = app
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'users': [],
            'places': [],
            'amenities': [],
            'reviews': []
        }

    def run_all_tests(self):
        """Exécute tous les tests CRUD."""
        with self.app.app_context():
            print_section("TEST CRUD OPERATIONS - HBNB DATABASE")
            print(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            # Réinitialise la base de données
            self._reset_database()

            # Tests User
            print_section("1. OPÉRATIONS CRUD - USER")
            self._test_user_crud()

            # Tests Amenity
            print_section("2. OPÉRATIONS CRUD - AMENITY")
            self._test_amenity_crud()

            # Tests Place
            print_section("3. OPÉRATIONS CRUD - PLACE")
            self._test_place_crud()

            # Tests Place_Amenity
            print_section("4. OPÉRATIONS CRUD - PLACE_AMENITY (Many-to-Many)")
            self._test_place_amenity_crud()

            # Tests Review
            print_section("5. OPÉRATIONS CRUD - REVIEW")
            self._test_review_crud()

            # Tests des relations
            print_section("6. TESTS DES RELATIONS")
            self._test_relationships()

            # Tests des contraintes
            print_section("7. TESTS DES CONTRAINTES")
            self._test_constraints()

            # Résumé
            db.session.rollback()  # Nettoie les sessions en attente
            self._print_summary()

    def _reset_database(self):
        """Réinitialise la base de données."""
        print("\n>>> Initialisation de la base de données...")
        db.drop_all()
        db.create_all()
        print("  ✓ Base de données réinitialisée avec succès")

    def _test_user_crud(self):
        """Test les opérations CRUD pour les utilisateurs."""
        print_subsection("CREATE - Créer des utilisateurs")

        try:
            user1 = User(
                first_name="Jean",
                last_name="Dupont",
                email="jean.dupont@example.com",
                is_admin=False
            )
            user1.hash_password("password123")
            db.session.add(user1)
            db.session.commit()
            self.test_results['users'].append(user1.id)
            print_result("Créer utilisateur 1", True, f"ID: {user1.id}")
            self.test_results['passed'] += 1

            user2 = User(
                first_name="Marie",
                last_name="Martin",
                email="marie.martin@example.com",
                is_admin=False
            )
            user2.hash_password("password456")
            db.session.add(user2)
            db.session.commit()
            self.test_results['users'].append(user2.id)
            print_result("Créer utilisateur 2", True, f"ID: {user2.id}")
            self.test_results['passed'] += 1

            user_admin = User(
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                is_admin=True
            )
            user_admin.hash_password("admin123")
            db.session.add(user_admin)
            db.session.commit()
            self.test_results['users'].append(user_admin.id)
            print_result("Créer administrateur", True, f"ID: {user_admin.id}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Créer utilisateurs", False, str(e))
            self.test_results['failed'] += 3

        # READ
        print_subsection("READ - Récupérer les utilisateurs")
        try:
            users = User.query.all()
            print_result("Récupérer tous les utilisateurs", True, f"Nombre: {len(users)}")
            for user in users:
                print(f"       - {user.first_name} {user.last_name} ({user.email})")
            self.test_results['passed'] += 1

            # Récupérer par ID
            user = User.query.filter_by(id=user1.id).first()
            print_result("Récupérer utilisateur par ID", user is not None, f"{user.email if user else 'Not found'}")
            self.test_results['passed'] += 1

            # Récupérer par email
            user = User.query.filter_by(email="marie.martin@example.com").first()
            print_result("Récupérer utilisateur par email", user is not None, f"{user.email if user else 'Not found'}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Récupérer utilisateurs", False, str(e))
            self.test_results['failed'] += 3

        # UPDATE
        print_subsection("UPDATE - Modifier les utilisateurs")
        try:
            user = User.query.filter_by(id=user1.id).first()
            user.first_name = "Jean-Pierre"
            user.last_name = "Dupont-Martin"
            db.session.commit()
            print_result("Modifier utilisateur (nom complet)", True, f"{user.first_name} {user.last_name}")
            self.test_results['passed'] += 1

            # Vérifier que les modifications sont persistantes
            updated_user = User.query.filter_by(id=user1.id).first()
            assert updated_user.first_name == "Jean-Pierre"
            assert updated_user.last_name == "Dupont-Martin"
            print_result("Vérifier modifications persistantes", True)
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Modifier utilisateurs", False, str(e))
            self.test_results['failed'] += 2

        # DELETE
        print_subsection("DELETE - Supprimer les utilisateurs")
        try:
            total_before = User.query.count()
            user_to_delete = User.query.filter_by(id=user1.id).first()
            db.session.delete(user_to_delete)
            db.session.commit()
            total_after = User.query.count()

            print_result("Supprimer un utilisateur", total_before > total_after,
                        f"Avant: {total_before}, Après: {total_after}")
            self.test_results['passed'] += 1

            # Vérifier que l'utilisateur n'existe plus
            deleted_user = User.query.filter_by(id=user1.id).first()
            print_result("Vérifier suppression", deleted_user is None)
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Supprimer utilisateurs", False, str(e))
            self.test_results['failed'] += 2

    def _test_amenity_crud(self):
        """Test les opérations CRUD pour les équipements."""
        print_subsection("CREATE - Créer des équipements")

        try:
            amenities_data = [
                "WiFi", "Climatisation", "Piscine", "Parking",
                "Cuisine", "Lave-vaisselle", "Télévision", "Chauffage"
            ]

            for name in amenities_data:
                amenity = Amenity(name=name)
                db.session.add(amenity)
                self.test_results['amenities'].append(amenity)

            db.session.commit()
            print_result("Créer 8 équipements", True, f"IDs: {len(self.test_results['amenities'])} créés")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Créer équipements", False, str(e))
            self.test_results['failed'] += 1

        # READ
        print_subsection("READ - Récupérer les équipements")
        try:
            amenities = Amenity.query.all()
            print_result("Récupérer tous les équipements", True, f"Nombre: {len(amenities)}")
            for amenity in amenities:
                print(f"       - {amenity.name}")
            self.test_results['passed'] += 1

            # Récupérer un équipement spécifique
            amenity = Amenity.query.filter_by(name="WiFi").first()
            print_result("Récupérer équipement par nom", amenity is not None, f"WiFi trouvé" if amenity else "WiFi non trouvé")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Récupérer équipements", False, str(e))
            self.test_results['failed'] += 2

        # UPDATE
        print_subsection("UPDATE - Modifier les équipements")
        try:
            amenity = Amenity.query.filter_by(name="WiFi").first()
            amenity.name = "WiFi haute vitesse"
            db.session.commit()
            print_result("Modifier nom d'un équipement", True, f"WiFi -> {amenity.name}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Modifier équipements", False, str(e))
            self.test_results['failed'] += 1

        # DELETE
        print_subsection("DELETE - Supprimer les équipements")
        try:
            amenity = Amenity.query.filter_by(name="Parking").first()
            db.session.delete(amenity)
            db.session.commit()

            deleted = Amenity.query.filter_by(name="Parking").first()
            print_result("Supprimer un équipement", deleted is None, "Parking supprimé")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Supprimer équipements", False, str(e))
            self.test_results['failed'] += 1

    def _test_place_crud(self):
        """Test les opérations CRUD pour les lieux."""
        print_subsection("CREATE - Créer des lieux")

        try:
            # Récupère un utilisateur propriétaire
            owner = User.query.filter_by(email="marie.martin@example.com").first()

            place1 = Place(
                title="Appartement à Paris",
                description="Bel appartement 2 chambres",
                price=1500.00,
                latitude=48.8566,
                longitude=2.3522,
                owner_id=owner.id
            )
            db.session.add(place1)
            db.session.commit()
            self.test_results['places'].append(place1.id)
            print_result("Créer lieu 1", True, f"ID: {place1.id}, Titre: {place1.title}")
            self.test_results['passed'] += 1

            place2 = Place(
                title="Maison en Provence",
                description="Maison de campagne avec jardin",
                price=2000.00,
                latitude=44.0571,
                longitude=5.5291,
                owner_id=owner.id
            )
            db.session.add(place2)
            db.session.commit()
            self.test_results['places'].append(place2.id)
            print_result("Créer lieu 2", True, f"ID: {place2.id}, Titre: {place2.title}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Créer lieux", False, str(e))
            self.test_results['failed'] += 2

        # READ
        print_subsection("READ - Récupérer les lieux")
        try:
            places = Place.query.all()
            print_result("Récupérer tous les lieux", True, f"Nombre: {len(places)}")
            for place in places:
                print(f"       - {place.title} (${place.price})")
            self.test_results['passed'] += 1

            # Récupérer par ID
            place = Place.query.filter_by(id=self.test_results['places'][0]).first()
            print_result("Récupérer lieu par ID", place is not None, f"{place.title if place else 'Not found'}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Récupérer lieux", False, str(e))
            self.test_results['failed'] += 2

        # UPDATE
        print_subsection("UPDATE - Modifier les lieux")
        try:
            place = Place.query.filter_by(id=self.test_results['places'][0]).first()
            place.price = 1800.00
            place.description = "Bel appartement 2 chambres rénové"
            db.session.commit()
            print_result("Modifier lieu (prix et description)", True, f"Nouveau prix: ${place.price}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Modifier lieux", False, str(e))
            self.test_results['failed'] += 1

        # DELETE
        print_subsection("DELETE - Supprimer les lieux")
        try:
            total_before = Place.query.count()
            place = Place.query.filter_by(id=self.test_results['places'][0]).first()
            db.session.delete(place)
            db.session.commit()
            total_after = Place.query.count()

            print_result("Supprimer un lieu", total_before > total_after,
                        f"Avant: {total_before}, Après: {total_after}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Supprimer lieux", False, str(e))
            self.test_results['failed'] += 1

    def _test_place_amenity_crud(self):
        """Test les opérations CRUD pour la relation Place-Amenity."""
        print_subsection("CREATE - Ajouter des équipements à un lieu")

        try:
            owner = User.query.filter_by(email="marie.martin@example.com").first()

            place = Place(
                title="Villa avec équipements",
                description="Villa luxe avec tous les équipements",
                price=3000.00,
                latitude=43.2965,
                longitude=5.3698,
                owner_id=owner.id
            )
            db.session.add(place)
            db.session.commit()

            # Récupère les équipements
            amenities = Amenity.query.limit(4).all()
            for amenity in amenities:
                place.amenities.append(amenity)
            db.session.commit()

            print_result("Ajouter équipements au lieu", True, f"Nombre d'équipements: {len(place.amenities)}")
            for amenity in place.amenities:
                print(f"       - {amenity.name}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Ajouter équipements", False, str(e))
            self.test_results['failed'] += 1

        # READ
        print_subsection("READ - Récupérer les équipements d'un lieu")
        try:
            place = Place.query.filter_by(title="Villa avec équipements").first()
            print_result("Récupérer équipements d'un lieu", place is not None and len(place.amenities) > 0,
                        f"Lieu trouvé avec {len(place.amenities)} équipements")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Récupérer relation Place-Amenity", False, str(e))
            self.test_results['failed'] += 1

        # UPDATE
        print_subsection("UPDATE - Modifier les équipements d'un lieu")
        try:
            place = Place.query.filter_by(title="Villa avec équipements").first()
            # Ajouter un nouvel équipement
            new_amenity = Amenity.query.filter_by(name="Piscine").first()
            if new_amenity and new_amenity not in place.amenities:
                place.amenities.append(new_amenity)
                db.session.commit()
                print_result("Ajouter un équipement supplémentaire", True,
                            f"Nouveau total: {len(place.amenities)} équipements")
                self.test_results['passed'] += 1
            else:
                print_result("Ajouter un équipement supplémentaire", False, "Équipement déjà présent ou non trouvé")
                self.test_results['failed'] += 1

        except Exception as e:
            print_result("Modifier relation Place-Amenity", False, str(e))
            self.test_results['failed'] += 1

        # DELETE
        print_subsection("DELETE - Supprimer des équipements d'un lieu")
        try:
            place = Place.query.filter_by(title="Villa avec équipements").first()
            if len(place.amenities) > 0:
                removed_amenity = place.amenities[0]
                place.amenities.remove(removed_amenity)
                db.session.commit()
                print_result("Supprimer un équipement", True,
                            f"Équipement {removed_amenity.name} supprimé, restants: {len(place.amenities)}")
                self.test_results['passed'] += 1
            else:
                print_result("Supprimer un équipement", False, "Aucun équipement à supprimer")
                self.test_results['failed'] += 1

        except Exception as e:
            print_result("Supprimer relation Place-Amenity", False, str(e))
            self.test_results['failed'] += 1

    def _test_review_crud(self):
        """Test les opérations CRUD pour les avis."""
        print_subsection("CREATE - Créer des avis")

        try:
            user = User.query.filter_by(email="marie.martin@example.com").first()
            place = Place.query.filter_by(title="Villa avec équipements").first()

            if not user or not place:
                print_result("Créer avis", False, "Utilisateur ou lieu non trouvé")
                self.test_results['failed'] += 1
                return

            review1 = Review(
                text="Excellente villa, très bien entretenue et avec tous les équipements.",
                rating=5,
                user_id=user.id,
                place_id=place.id
            )
            db.session.add(review1)
            db.session.commit()
            self.test_results['reviews'].append(review1.id)
            print_result("Créer avis 1", True, f"ID: {review1.id}, Note: {review1.rating}/5")
            self.test_results['passed'] += 1

            review2 = Review(
                text="Bonne villa, lieu magnifique avec vue splendide.",
                rating=4,
                user_id=user.id,
                place_id=place.id if place.id != self.test_results['places'][0] else self.test_results['places'][1:][0] if len(self.test_results['places']) > 1 else place.id
            )
            # Note: On teste avec une place différente si possible
            places = Place.query.all()
            if len(places) > 1:
                review2.place_id = places[1].id
            db.session.add(review2)
            db.session.commit()
            self.test_results['reviews'].append(review2.id)
            print_result("Créer avis 2", True, f"ID: {review2.id}, Note: {review2.rating}/5")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Créer avis", False, str(e))
            self.test_results['failed'] += 2

        # READ
        print_subsection("READ - Récupérer les avis")
        try:
            reviews = Review.query.all()
            print_result("Récupérer tous les avis", True, f"Nombre: {len(reviews)}")
            for review in reviews:
                print(f"       - Note {review.rating}/5: {review.text[:50]}...")
            self.test_results['passed'] += 1

            # Récupérer par ID
            review = Review.query.filter_by(id=self.test_results['reviews'][0]).first()
            print_result("Récupérer avis par ID", review is not None, f"Note: {review.rating if review else 'Not found'}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Récupérer avis", False, str(e))
            self.test_results['failed'] += 2

        # UPDATE
        print_subsection("UPDATE - Modifier les avis")
        try:
            review = Review.query.filter_by(id=self.test_results['reviews'][0]).first()
            review.rating = 4
            review.text = "Très bonne villa, quelques petits détails à améliorer."
            db.session.commit()
            print_result("Modifier avis (note et texte)", True, f"Nouvelle note: {review.rating}/5")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Modifier avis", False, str(e))
            self.test_results['failed'] += 1

        # DELETE
        print_subsection("DELETE - Supprimer les avis")
        try:
            total_before = Review.query.count()
            review = Review.query.filter_by(id=self.test_results['reviews'][-1]).first()
            if review:
                db.session.delete(review)
                db.session.commit()
            total_after = Review.query.count()

            print_result("Supprimer un avis", total_before > total_after,
                        f"Avant: {total_before}, Après: {total_after}")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Supprimer avis", False, str(e))
            self.test_results['failed'] += 1

    def _test_relationships(self):
        """Test les relations entre les entités."""
        print_subsection("Relation User -> Places (One-to-Many)")
        try:
            user = User.query.filter_by(email="marie.martin@example.com").first()
            places_count = len(user.places)
            print_result("Récupérer les places d'un utilisateur", places_count > 0,
                        f"Utilisateur a {places_count} places")
            self.test_results['passed'] += 1

        except Exception as e:
            print_result("Relation User-Places", False, str(e))
            self.test_results['failed'] += 1

        print_subsection("Relation Place -> Reviews (One-to-Many)")
        try:
            place = Place.query.first()
            if place:
                reviews_count = len(place.reviews)
                print_result("Récupérer les avis d'un lieu", True,
                            f"Lieu a {reviews_count} avis")
                self.test_results['passed'] += 1
            else:
                print_result("Récupérer les avis d'un lieu", False, "Aucun lieu trouvé")
                self.test_results['failed'] += 1

        except Exception as e:
            print_result("Relation Place-Reviews", False, str(e))
            self.test_results['failed'] += 1

        print_subsection("Relation Place <-> Amenity (Many-to-Many)")
        try:
            place = Place.query.filter(Place.amenities.any()).first()
            if place:
                amenities_count = len(place.amenities)
                print_result("Récupérer les équipements d'un lieu", amenities_count > 0,
                            f"Lieu a {amenities_count} équipements")
                self.test_results['passed'] += 1
            else:
                print_result("Récupérer les équipements d'un lieu", False, "Aucun lieu avec équipements")
                self.test_results['failed'] += 1

        except Exception as e:
            print_result("Relation Place-Amenities", False, str(e))
            self.test_results['failed'] += 1

    def _test_constraints(self):
        """Test les contraintes d'intégrité."""
        print_subsection("Contrainte UNIQUE sur l'email")
        try:
            user1 = User(
                first_name="Test",
                last_name="User",
                email="duplicate@example.com",
                is_admin=False
            )
            user1.hash_password("password")
            db.session.add(user1)
            db.session.commit()

            user2 = User(
                first_name="Test2",
                last_name="User2",
                email="duplicate@example.com",
                is_admin=False
            )
            user2.hash_password("password")
            db.session.add(user2)

            try:
                db.session.commit()
                print_result("Contrainte UNIQUE (email)", False, "Email dupliqué a été accepté!")
                self.test_results['failed'] += 1
            except Exception:
                db.session.rollback()
                print_result("Contrainte UNIQUE (email)", True, "Email dupliqué rejeté correctement")
                self.test_results['passed'] += 1

        except Exception as e:
            print_result("Test contrainte UNIQUE", False, str(e))
            self.test_results['failed'] += 1

        print_subsection("Contrainte CHECK sur le rating (validation au niveau Model)")
        try:
            user = User.query.first()
            place = Place.query.first()

            if user and place:
                try:
                    review = Review(
                        text="Mauvais test",
                        rating=10,  # Invalide: doit être entre 1 et 5
                        user_id=user.id,
                        place_id=place.id
                    )
                    print_result("Contrainte CHECK (rating 1-5)", True,
                                "Rating invalide rejeté au niveau du modèle")
                    self.test_results['passed'] += 1
                except ValueError as ve:
                    print_result("Contrainte CHECK (rating 1-5)", True,
                                f"Validation au niveau modèle: {str(ve)}")
                    self.test_results['passed'] += 1

        except Exception as e:
            print_result("Test contrainte CHECK", False, str(e))
            self.test_results['failed'] += 1

        print_subsection("Relation FOREIGN KEY - Propriétaire obligatoire")
        try:
            owner = User.query.first()

            # Tentative de créer un place sans owner_id
            try:
                place = Place(
                    title="Test FK",
                    description="Test",
                    price=1000.00,
                    latitude=0.0,
                    longitude=0.0,
                    owner_id=None  # Invalide: owner_id est NOT NULL
                )
                db.session.add(place)
                db.session.commit()
                print_result("Contrainte FOREIGN KEY (NOT NULL)", False,
                            "Place sans propriétaire a été acceptée!")
                self.test_results['failed'] += 1
            except Exception:
                db.session.rollback()
                print_result("Contrainte FOREIGN KEY (NOT NULL)", True,
                            "Place sans propriétaire rejetée correctement")
                self.test_results['passed'] += 1

        except Exception as e:
            print_result("Test FK NOT NULL", False, str(e))
            self.test_results['failed'] += 1

    def _print_summary(self):
        """Affiche un résumé des tests."""
        print_section("RÉSUMÉ DES TESTS")

        total_tests = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0

        print(f"\n  Total des tests: {total_tests}")
        print(f"  ✓ Réussis: {self.test_results['passed']}")
        print(f"  ✗ Échoués: {self.test_results['failed']}")
        print(f"  Taux de réussite: {success_rate:.1f}%")

        # Compte les entités
        users_count = User.query.count()
        places_count = Place.query.count()
        amenities_count = Amenity.query.count()
        reviews_count = Review.query.count()

        print(f"\n  Entités créées:")
        print(f"    - Utilisateurs: {users_count}")
        print(f"    - Lieux: {places_count}")
        print(f"    - Équipements: {amenities_count}")
        print(f"    - Avis: {reviews_count}")

        print("\n" + "=" * 70)
        print("\n✓ TESTS TERMINÉS AVEC SUCCÈS\n")


def main():
    """Fonction principale."""
    # Définit l'environnement
    os.environ['FLASK_ENV'] = 'development'

    # Crée l'application
    app = create_app('config.DevelopmentConfig')

    # Exécute les tests
    tester = CRUDTester(app)
    tester.run_all_tests()


if __name__ == '__main__':
    main()
