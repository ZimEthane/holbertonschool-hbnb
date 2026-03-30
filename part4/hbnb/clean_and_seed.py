#!/usr/bin/python3
"""Script pour nettoyer et seeder la base de données avec données de test."""

import os
import json
import sys
from pathlib import Path

# Ajouter le répertoire au chemin
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

def main():
    app = create_app()
    with app.app_context():
        # Supprimer la base de données existante
        db._remove_records = True
        print("🗑️  Suppression de la base de données...")
        db.drop_all()
        db.create_all()
        print("✓ Base de données réinitialisée\n")

        # ========== UTILISATEURS ==========
        print("👥 Création des utilisateurs...")

        # Admin
        admin = User(
            email='admin@hbnb.com',
            first_name='Admin',
            last_name='HBNB',
            is_admin=True
        )
        admin.hash_password('Admin123!')
        db.session.add(admin)
        db.session.flush()
        print(f"✓ Admin créé")
        print(f"  📧 Email: admin@hbnb.com")
        print(f"  🔑 Mot de passe: Admin123!")

        # User normal
        user = User(
            email='user@hbnb.com',
            first_name='Jean',
            last_name='Dupont',
            is_admin=False
        )
        user.hash_password('User123!')
        db.session.add(user)
        db.session.flush()
        print(f"✓ Utilisateur créé")
        print(f"  📧 Email: user@hbnb.com")
        print(f"  🔑 Mot de passe: User123!")

        # Créer 2 autres utilisateurs pour les avis
        user2 = User(
            email='marie@hbnb.com',
            first_name='Marie',
            last_name='Martin',
            is_admin=False
        )
        user2.hash_password('Marie123!')
        db.session.add(user2)
        db.session.flush()

        user3 = User(
            email='pierre@hbnb.com',
            first_name='Pierre',
            last_name='Bernard',
            is_admin=False
        )
        user3.hash_password('Pierre123!')
        db.session.add(user3)
        db.session.flush()
        print(f"✓ 2 utilisateurs supplémentaires créés\n")

        db.session.commit()

        # ========== AMENITIES ==========
        print("🏠 Création des aménités...")

        amenities_data = [
            'WiFi',
            'Cuisine',
            'Parking',
            'Piscine',
            'Climatisation',
            'Chauffage',
            'TV',
            'Lave-linge',
            'Sèche-linge',
            'Balcon',
            'Ascenseur',
            'Ascenseur',
        ]

        amenities = {}
        for name in amenities_data:
            existing = Amenity.query.filter_by(name=name).first()
            if not existing:
                amen = Amenity(name=name)
                db.session.add(amen)
                db.session.flush()
                amenities[name] = amen
                print(f"✓ {name}")
            else:
                amenities[name] = existing

        db.session.commit()
        print()

        # ========== PLACES ==========
        print("🏠 Création des places...")

        places_data = [
            {
                'title': 'Studio Moderne Paris 12',
                'description': 'Petit studio moderne et lumineux en plein cœur de Paris. Parfait pour un court séjour.',
                'price': 45.0,
                'latitude': 48.8566,
                'longitude': 2.3522,
                'owner': admin,
                'amenities': ['WiFi', 'Climatisation', 'TV'],
                'images': [
                    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=600&q=80'
                ]
            },
            {
                'title': 'Appartement Confortable Marais',
                'description': 'Joli appartement avec balcon dans le quartier du Marais. Bien situé pour visiter.',
                'price': 75.0,
                'latitude': 48.8645,
                'longitude': 2.3567,
                'owner': user,
                'amenities': ['WiFi', 'Cuisine', 'Parking', 'Balcon'],
                'images': [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
                    'https://images.unsplash.com/photo-1516594915250-74b3f299d867?w=600&q=80'
                ]
            },
            {
                'title': 'Villa Luxe avec Piscine',
                'description': 'Belle villa avec piscine privée et jardin. Idéale pour famille ou groupe.',
                'price': 150.0,
                'latitude': 48.7758,
                'longitude': 2.2975,
                'owner': user2,
                'amenities': ['Piscine', 'Parking', 'Cuisine', 'WiFi', 'Chauffage'],
                'images': [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
                    'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=600&q=80',
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80'
                ]
            }
        ]

        places = {}
        for place_data in places_data:
            place = Place(
                title=place_data['title'],
                description=place_data['description'],
                price=place_data['price'],
                latitude=place_data['latitude'],
                longitude=place_data['longitude'],
                owner_id=place_data['owner'].id,
                image_urls=json.dumps(place_data['images'])
            )
            db.session.add(place)
            db.session.flush()

            # Ajouter les aménités
            for amen_name in place_data['amenities']:
                if amen_name in amenities:
                    place.amenities.append(amenities[amen_name])

            places[place_data['title']] = place
            print(f"✓ {place_data['title']} ({place_data['price']}€)")

        db.session.commit()
        print()

        # ========== REVIEWS ==========
        print("⭐ Création des avis...")

        reviews_data = [
            {
                'text': 'Studio super bien situé! Propriétaire très accueillant.',
                'rating': 5,
                'place': 'Studio Moderne Paris 12',
                'reviewer': user2
            },
            {
                'text': 'Très satisfait de mon séjour. Propre et confortable.',
                'rating': 4,
                'place': 'Studio Moderne Paris 12',
                'reviewer': user3
            },
            {
                'text': 'Magnifique appartement! Vue superbe depuis le balcon.',
                'rating': 5,
                'place': 'Appartement Confortable Marais',
                'reviewer': user3
            },
            {
                'text': 'La villa dépasse les attentes. Jardin avec piscine parfait!',
                'rating': 5,
                'place': 'Villa Luxe avec Piscine',
                'reviewer': user
            },
            {
                'text': 'Bien maintenu, bon rapport qualité-prix.',
                'rating': 4,
                'place': 'Villa Luxe avec Piscine',
                'reviewer': user2
            }
        ]

        for review_data in reviews_data:
            place = places.get(review_data['place'])
            if place:
                review = Review(
                    text=review_data['text'],
                    rating=review_data['rating'],
                    place_id=place.id,
                    user_id=review_data['reviewer'].id
                )
                db.session.add(review)
                print(f"✓ {review_data['rating']}⭐ pour '{review_data['place']}'")

        db.session.commit()
        print()

        # ========== RESUME ==========
        print("=" * 50)
        print("✅ Base de données prête!\n")
        print("📊 DONNÉES CRÉÉES:")
        print(f"   • 1 Admin + 3 Utilisateurs = 4 utilisateurs")
        print(f"   • {len(places)} places")
        print(f"   • {len(amenities)} aménités")
        print(f"   • {len(reviews_data)} avis\n")

        print("🔐 IDENTIFIANTS:\n")
        print("Admin:")
        print("  📧 admin@hbnb.com")
        print("  🔑 Admin123!\n")
        print("User Normal:")
        print("  📧 user@hbnb.com")
        print("  🔑 User123!")
        print("=" * 50)

if __name__ == '__main__':
    main()
