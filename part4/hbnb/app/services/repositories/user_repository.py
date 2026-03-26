from app.models.user import User
from app import db
from app.persistence.repository import SQLAlchemyRepository
 
 
class UserRepository(SQLAlchemyRepository):
    """Référentiel dédié aux opérations sur l'entité User."""
 
    def __init__(self):
        super().__init__(User)
 
    def get_user_by_email(self, email):
        """Recherche un utilisateur par adresse e-mail."""
        return self.model.query.filter_by(email=email).first()
