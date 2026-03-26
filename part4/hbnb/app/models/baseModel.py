#!/usr/bin/python3
import uuid
from datetime import datetime
from app.extensions import db


class BaseModel(db.Model):
    __abstract__ = True  # SQLAlchemy ne crée pas de table pour BaseModel

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def save(self):
        """Met à jour updated_at et commit en base."""
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def update(self, data):
        """Met à jour les attributs de l'objet à partir d'un dictionnaire."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()

    def to_dict(self):
        """Convertit l'objet en dictionnaire pour la sérialisation JSON."""
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }