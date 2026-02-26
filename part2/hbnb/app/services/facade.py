from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.amenities = {}  # Stockage en mémoire des amenities

    ##########################
    ## User-related methods ##
    ##########################

    def create_user(self, user_data):
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)



    #############################   
    ## Amenity-related methods ##
    #############################

    def create_amenity(self, amenity_data):
        """Crée un nouvel Amenity et le stocke"""
        try:
            amenity = Amenity(name=amenity_data['name'])
        except (TypeError, ValueError) as e:
            raise ValueError(str(e))
        self.amenities[amenity.id] = amenity
        return amenity

    def get_amenity(self, amenity_id):
        """Récupère un Amenity par son ID"""
        return self.amenities.get(amenity_id)

    def get_all_amenities(self):
        """Récupère tous les Amenity"""
        return list(self.amenities.values())

    def update_amenity(self, amenity_id, amenity_data):
        """Met à jour un Amenity existant"""
        amenity = self.get_amenity(amenity_id)
        if not amenity:
            return None
        if 'name' in amenity_data:
            try:
                amenity.name = amenity_data['name']
            except (TypeError, ValueError) as e:
                raise ValueError(str(e))
        amenity.save()
        return amenity
