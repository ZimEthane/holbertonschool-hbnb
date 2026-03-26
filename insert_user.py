#!/usr/bin/python3
"""Script pour insérer un utilisateur via Flask-Script ou Shell."""

import os
import sys
from pathlib import Path

# Ajouter le répertoire parent au chemin
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root.parent))

# Initialiser Flask
from part4.hbnb.app import create_app
from part4.hbnb.app.extensions import db
from part4.hbnb.app.models.user import User

# Créer l'application
app = create_app()

# Créer le contexte de l'app
with app.app_context():
    # Données de l'utilisateur
    user_data = {
        "first_name": "ethane",
        "last_name": "zimmermann",
        "email": "ethane@hotmail.com",
        "password": "1234"
    }

    # Vérifier si l'utilisateur existe
    existing_user = User.query.filter_by(email=user_data['email']).first()
    if existing_user:
        print(f"❌ Utilisateur avec l'email {user_data['email']} existe déjà!")
        print(f"   ID: {existing_user.id}")
        sys.exit(1)

    try:
        # Créer l'utilisateur
        new_user = User(
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            email=user_data['email']
        )
        new_user.hash_password(user_data['password'])

        db.session.add(new_user)
        db.session.commit()

        print("✅ Utilisateur créé avec succès!")
        print(f"   ID: {new_user.id}")
        print(f"   Nom: {new_user.first_name} {new_user.last_name}")
        print(f"   Email: {new_user.email}")
        print(f"   Admin: {new_user.is_admin}")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Erreur: {str(e)}")
        sys.exit(1)
