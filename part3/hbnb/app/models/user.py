#!/usr/bin/python3
from app.extensions import db
from app.extensions import bcrypt
from sqlalchemy.orm import validates
from .baseModel import BaseModel


class User(BaseModel):
    __tablename__ = 'users'
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    # ── Validateurs SQLAlchemy ──────────────────────────────────────────────

    @validates('first_name')
    def validate_first_name(self, key, value):
        if not isinstance(value, str):
            raise TypeError("first_name must be a string")
        if not value.strip():
            raise ValueError("first_name must not be empty")
        if len(value) > 50:
            raise ValueError("first_name must not exceed 50 characters")
        return value

    @validates('last_name')
    def validate_last_name(self, key, value):
        if not isinstance(value, str):
            raise TypeError("last_name must be a string")
        if not value.strip():
            raise ValueError("last_name must not be empty")
        if len(value) > 50:
            raise ValueError("last_name must not exceed 50 characters")
        return value

    @validates('email')
    def validate_email(self, key, value):
        if not isinstance(value, str):
            raise TypeError("email must be a string")
        if not value.strip():
            raise ValueError("email must not be empty")
        if "@" not in value or "." not in value:
            raise ValueError("email must be a valid email address")
        return value

    @validates('is_admin')
    def validate_is_admin(self, key, value):
        if not isinstance(value, bool):
            raise TypeError("is_admin must be a boolean")
        return value

    # ── Méthodes mot de passe ───────────────────────────────────────────────

    def hash_password(self, password):
        """Hache le mot de passe avant de le stocker."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Vérifie que le mot de passe correspond au hash stocké."""
        return bcrypt.check_password_hash(self.password, password)

    # ── Sérialisation ───────────────────────────────────────────────────────

    def to_dict(self):
        """Convertit l'utilisateur en dictionnaire pour la sérialisation JSON."""
        base = super().to_dict()
        base.update({
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_admin": self.is_admin,
        })
        return base