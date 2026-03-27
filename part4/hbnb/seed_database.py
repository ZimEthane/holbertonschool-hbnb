#!/usr/bin/python3
"""Script pour seeder la base de données avec des données de test."""

import sys
from pathlib import Path
from werkzeug.security import generate_password_hash

# Ajouter le répertoire au chemin
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

app = create_app()

with app.app_context():
    # Supprimer les données existantes (optionnel)
    # db.drop_all()
    # db.create_all()

    print("🌱 Création des utilisateurs...")

    # Utilisateurs
    users_data = [
        {
            'email': 'alice@example.com',
            'password': 'password123',
            'first_name': 'Alice',
            'last_name': 'Dupont'
        },
        {
            'email': 'bob@example.com',
            'password': 'password123',
            'first_name': 'Bob',
            'last_name': 'Martin'
        },
        {
            'email': 'charlie@example.com',
            'password': 'password123',
            'first_name': 'Charlie',
            'last_name': 'Bernard'
        },
        {
            'email': 'ethane@hotmail.com',
            'password': 'password123',
            'first_name': 'Ethane',
            'last_name': 'Smith'
        }
    ]

    users = {}
    for user_data in users_data:
        existing = User.query.filter_by(email=user_data['email']).first()
        if existing:
            print(f"⚠ Utilisateur {user_data['email']} existe déjà")
            users[user_data['email']] = existing
        else:
            new_user = User(
                email=user_data['email'],
                password=generate_password_hash(user_data['password']),
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            db.session.add(new_user)
            db.session.flush()
            users[user_data['email']] = new_user
            print(f"✓ Utilisateur créé: {user_data['first_name']} {user_data['last_name']} ({user_data['email']})")

    db.session.commit()

    print("\n🏠 Création des places...")

    # Données des places
    places_data = [
        {
            'title': 'Studio Minimaliste Budget',
            'description': 'Studio très petit mais fonctionnel. Parfait pour backpackers.',
            'price': 10.0,
            'latitude': 48.8566,
            'longitude': 2.3522,
            'owner_email': 'alice@example.com'
        },
        {
            'title': 'Chambre Simple Propre',
            'description': 'Chambre simple dans immeuble ancien. Salle de bain partagée.',
            'price': 20.0,
            'latitude': 48.8400,
            'longitude': 2.3700,
            'owner_email': 'bob@example.com'
        },
        {
            'title': 'Petit Logement Pratique',
            'description': 'Petit logement pratique et bien situé. Proche métro.',
            'price': 50.0,
            'latitude': 48.8300,
            'longitude': 2.3800,
            'owner_email': 'alice@example.com'
        },
        {
            'title': 'Appartement Confortable 100',
            'description': 'Appartement confortable avec tous les équipements. Bien aménagé.',
            'price': 100.0,
            'latitude': 48.8200,
            'longitude': 2.3900,
            'owner_email': 'charlie@example.com'
        },
        {
            'title': 'Cosy Studio au Centre-Ville',
            'description': 'Un studio moderne et confortable au cœur de la ville. Idéal pour un séjour court.',
            'price': 75.0,
            'latitude': 48.8566,
            'longitude': 2.3522,
            'owner_email': 'ethane@hotmail.com'
        },
        {
            'title': 'Appartement de Luxe avec Vue',
            'description': 'Apartement élégant avec vue panoramique sur la ville. Équipements haut de gamme.',
            'price': 150.0,
            'latitude': 48.8848,
            'longitude': 2.2945,
            'owner_email': 'bob@example.com'
        },
        {
            'title': 'Maison de Famille Spacieuse',
            'description': 'Grande maison parfaite pour les familles. Jardin privé, cuisine équipée.',
            'price': 120.0,
            'latitude': 48.7758,
            'longitude': 2.2975,
            'owner_email': 'charlie@example.com'
        },
        {
            'title': 'Loft Industrial Chic',
            'description': 'Loft tendance avec style industrial. Plafonds hauts, beaux volumes.',
            'price': 95.0,
            'latitude': 48.8357,
            'longitude': 2.3577,
            'owner_email': 'alice@example.com'
        },
        {
            'title': 'Villa avec Piscine Privée',
            'description': 'Luxueuse villa avec piscine privée. Terrasse ensoleillée, parking.',
            'price': 200.0,
            'latitude': 48.7045,
            'longitude': 2.2230,
            'owner_email': 'bob@example.com'
        },
        {
            'title': 'Penthouse Moderne avec Terrasse',
            'description': 'Penthouse contemporain avec terrasse panoramique. Vue sur les toits de Paris.',
            'price': 180.0,
            'latitude': 48.8645,
            'longitude': 2.3522,
            'owner_email': 'ethane@hotmail.com'
        },
        {
            'title': 'Petit Appartement Cosy',
            'description': 'Petit appartement confortable et bien situé. Idéal pour couples.',
            'price': 55.0,
            'latitude': 48.8465,
            'longitude': 2.3522,
            'owner_email': 'charlie@example.com'
        },
        {
            'title': 'Studio avec Balcon',
            'description': 'Studio lumineux avec balcon. Proche des transports en commun.',
            'price': 65.0,
            'latitude': 48.8678,
            'longitude': 2.3506,
            'owner_email': 'bob@example.com'
        },
    ]

    places = {}
    for place_data in places_data:
        existing = Place.query.filter_by(title=place_data['title']).first()
        if existing:
            print(f"⚠ Place '{place_data['title']}' existe déjà")
            places[place_data['title']] = existing
        else:
            owner = users[place_data['owner_email']]
            new_place = Place(
                title=place_data['title'],
                description=place_data['description'],
                price=place_data['price'],
                latitude=place_data['latitude'],
                longitude=place_data['longitude'],
                owner_id=owner.id
            )
            db.session.add(new_place)
            db.session.flush()
            places[place_data['title']] = new_place
            print(f"✓ Place créée: {place_data['title']} ({place_data['price']}€)")

    db.session.commit()

    print("\n⭐ Création des avis (reviews)...")

    # Données des avis
    reviews_data = [
        {
            'text': 'Très bien! Endroit propre et accueillant.',
            'rating': 5,
            'place_title': 'Studio Minimaliste Budget',
            'reviewer_email': 'bob@example.com'
        },
        {
            'text': 'Pas mal, mais un peu bruyant la nuit.',
            'rating': 3,
            'place_title': 'Chambre Simple Propre',
            'reviewer_email': 'alice@example.com'
        },
        {
            'text': 'Parfait pour un court séjour!',
            'rating': 5,
            'place_title': 'Cosy Studio au Centre-Ville',
            'reviewer_email': 'charlie@example.com'
        },
        {
            'text': 'Bonne situation, mais petit soucis avec la climatisation.',
            'rating': 4,
            'place_title': 'Petit Logement Pratique',
            'reviewer_email': 'bob@example.com'
        },
        {
            'text': 'Magnifique vue! Très recommandé!',
            'rating': 5,
            'place_title': 'Penthouse Moderne avec Terrasse',
            'reviewer_email': 'alice@example.com'
        },
        {
            'text': 'Bon rapport qualité-prix.',
            'rating': 4,
            'place_title': 'Loft Industrial Chic',
            'reviewer_email': 'bob@example.com'
        },
    ]

    for review_data in reviews_data:
        place = places.get(review_data['place_title'])
        reviewer = users.get(review_data['reviewer_email'])

        if place and reviewer:
            existing = Review.query.filter_by(
                place_id=place.id,
                user_id=reviewer.id
            ).first()

            if existing:
                print(f"⚠ Avis de {reviewer.first_name} pour '{review_data['place_title']}' existe déjà")
            else:
                new_review = Review(
                    text=review_data['text'],
                    rating=review_data['rating'],
                    place_id=place.id,
                    user_id=reviewer.id
                )
                db.session.add(new_review)
                db.session.flush()
                print(f"✓ Avis créé: {review_data['rating']}⭐ pour '{review_data['place_title']}'")

    db.session.commit()

    print("\n✅ Base de données seedée avec succès!")
    print(f"   📝 {len(users)} utilisateurs")
    print(f"   🏠 {len(places)} places")
    print(f"   ⭐ {len(reviews_data)} avis")
