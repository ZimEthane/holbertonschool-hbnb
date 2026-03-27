#!/usr/bin/python3
"""Script pour insérer plusieurs places dans la base de données."""

import json
import sys
from pathlib import Path

# Ajouter le répertoire au chemin
project_root = Path(__file__).parent / 'part4' / 'hbnb'
if not project_root.exists():
    project_root = Path(__file__).parent

sys.path.insert(0, str(project_root))

from app import create_app
from app.extensions import db
from app.models.place import Place
from app.models.user import User

app = create_app()


def get_place_images(place_title):
    image_map = {
        'Studio Minimaliste Budget': [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'
        ],
        'Chambre Simple Propre': [
            'https://images.unsplash.com/photo-1616594039964-3c8be0f24f8f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80'
        ],
        'Petit Logement Pratique': [
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80'
        ],
        'Appartement Confortable 100': [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
        ],
        'Cosy Studio au Centre-Ville': [
            'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80'
        ],
        'Appartement de Luxe avec Vue': [
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        'Maison de Famille Spacieuse': [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80'
        ],
        'Loft Industrial Chic': [
            'https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80'
        ],
        'Villa avec Piscine Privée': [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80'
        ],
        'Penthouse Moderne avec Terrasse': [
            'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
        ],
        'Petit Appartement Cosy': [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
        ],
        'Studio avec Balcon': [
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80'
        ],
        'Belle Maison en Banlieue': [
            'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'
        ],
        'Loft Spacieux avec Cuisine Ouverte': [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'
        ],
    }
    return image_map.get(place_title, [
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80'
    ])

with app.app_context():
    # Récupérer l'utilisateur Ethane (owner)
    owner = User.query.filter_by(email='ethane@hotmail.com').first()
    if not owner:
        print("❌ Utilisateur ethane@hotmail.com non trouvé!")
        sys.exit(1)

    print(f"✓ Owner trouvé: {owner.first_name} {owner.last_name}")

    # Données des places
    places_data = [
        {
            'title': 'Studio Minimaliste Budget',
            'description': 'Studio très petit mais fonctionnel. Parfait pour backpackers.',
            'price': 10.0,
            'latitude': 48.8566,
            'longitude': 2.3522,  # Paris
        },
        {
            'title': 'Chambre Simple Propre',
            'description': 'Chambre simple dans immeuble ancien. Salle de bain partagée.',
            'price': 20.0,
            'latitude': 48.8400,
            'longitude': 2.3700,  # Paris Centre
        },
        {
            'title': 'Petit Logement Pratique',
            'description': 'Petit logement pratique et bien situé. Proche métro.',
            'price': 50.0,
            'latitude': 48.8300,
            'longitude': 2.3800,  # Paris
        },
        {
            'title': 'Appartement Confortable 100',
            'description': 'Appartement confortable avec tous les équipements. Bien aménagé.',
            'price': 100.0,
            'latitude': 48.8200,
            'longitude': 2.3900,  # Paris
        },
        {
            'title': 'Cosy Studio au Centre-Ville',
            'description': 'Un studio moderne et confortable au cœur de la ville. Idéal pour un séjour court.',
            'price': 75.0,
            'latitude': 48.8566,
            'longitude': 2.3522,  # Paris
        },
        {
            'title': 'Appartement de Luxe avec Vue',
            'description': 'Apartement élégant avec vue panoramique sur la ville. Équipements haut de gamme.',
            'price': 150.0,
            'latitude': 48.8848,
            'longitude': 2.2945,  # Paris Nord
        },
        {
            'title': 'Maison de Famille Spacieuse',
            'description': 'Grande maison parfaite pour les familles. Jardin privé, cuisine équipée.',
            'price': 120.0,
            'latitude': 48.7758,
            'longitude': 2.2975,  # Banlieue Paris
        },
        {
            'title': 'Loft Industrial Chic',
            'description': 'Loft tendance avec style industrial. Plafonds hauts, beaux volumes.',
            'price': 95.0,
            'latitude': 48.8357,
            'longitude': 2.3577,  # Marais
        },
        {
            'title': 'Villa avec Piscine Privée',
            'description': 'Luxueuse villa avec piscine privée. Terrasse ensoleillée, parking.',
            'price': 200.0,
            'latitude': 48.7045,
            'longitude': 2.2230,  # Versailles
        },
        {
            'title': 'Penthouse Moderne avec Terrasse',
            'description': 'Penthouse contemporain avec terrasse panoramique. Vue sur les toits de Paris.',
            'price': 180.0,
            'latitude': 48.8645,
            'longitude': 2.3522,  # Tour Eiffel
        },
        {
            'title': 'Petit Appartement Cosy',
            'description': 'Petit appartement confortable et bien situé. Idéal pour couples.',
            'price': 55.0,
            'latitude': 48.8465,
            'longitude': 2.3522,  # Île de la Cité
        },
        {
            'title': 'Studio avec Balcon',
            'description': 'Studio lumineux avec balcon. Proche des transports en commun.',
            'price': 65.0,
            'latitude': 48.8678,
            'longitude': 2.3506,  # Montmartre
        },
        {
            'title': 'Belle Maison en Banlieue',
            'description': 'Maison agréable en banlieue. Calme et verdoyant. Garage inclus.',
            'price': 110.0,
            'latitude': 48.7568,
            'longitude': 2.2674,  # Banlieue Ouest
        },
        {
            'title': 'Loft Spacieux avec Cuisine Ouverte',
            'description': 'Loft spacieux avec cuisine ouverte. Aménagement moderne et lumineux.',
            'price': 130.0,
            'latitude': 48.8566,
            'longitude': 2.3856,  # Bastille
        },
    ]

    created_count = 0
    for place_data in places_data:
        try:
            # Vérifier si la place existe déjà
            existing = Place.query.filter_by(title=place_data['title']).first()
            if existing:
                print(f"⚠ Place '{place_data['title']}' existe déjà")
                current_images = existing.get_image_urls() if hasattr(existing, 'get_image_urls') else []
                if not current_images:
                    existing.image_urls = json.dumps(get_place_images(place_data['title']))
                    print(f"  ↳ Images ajoutées pour '{place_data['title']}'")
                continue

            # Créer la place
            new_place = Place(
                title=place_data['title'],
                description=place_data['description'],
                price=place_data['price'],
                latitude=place_data['latitude'],
                longitude=place_data['longitude'],
                owner_id=owner.id,
                image_urls=json.dumps(get_place_images(place_data['title']))
            )

            db.session.add(new_place)
            db.session.flush()  # Flush pour obtenir l'ID

            print(f"✓ Place créée: {place_data['title']} ({place_data['price']}€)")
            created_count += 1

        except Exception as e:
            print(f"❌ Erreur pour '{place_data['title']}': {str(e)}")
            db.session.rollback()
            continue

    # Commit final
    try:
        db.session.commit()
        print(f"\n✅ {created_count} places créées avec succès!")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erreur lors du commit: {str(e)}")
        sys.exit(1)
