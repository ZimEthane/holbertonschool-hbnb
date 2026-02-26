from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.amenities = {}  # Stockage en mémoire des amenities
        self.places = {}

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


    ###########################
    ## Place-related methods ##
    ###########################


    def create_place(self, place_data):
        if place_data['owner_id'] not in self.users:
            raise ValueError("Owner not found")

        amenities_objs = []
        for amenity_id in place_data.get('amenities', []):
            amenity = self.amenities.get(amenity_id)
            if not amenity:
                raise ValueError(f"Amenity {amenity_id} not found")
            amenities_objs.append(amenity)

        place = Place(
            title=place_data['title'],
            description=place_data.get('description', ''),
            price=place_data['price'],
            latitude=place_data['latitude'],
            longitude=place_data['longitude'],
            owner_id=place_data['owner_id'],
            amenities=amenities_objs
        )

        self.places[place.id] = place
        return place

    def get_place(self, place_id):
        return self.places.get(place_id)

    def get_all_places(self):
        return list(self.places.values())

    def update_place(self, place_id, place_data):
        place = self.get_place(place_id)
        if not place:
            return None

        for key, value in place_data.items():
            if hasattr(place, key):
                setattr(place, key, value)

        place.save()
        return place

    def create_review(self, review_data):
    # Placeholder for logic to create a review, including validation for user_id, place_id, and rating
    pass

    def get_review(self, review_id):
        # Placeholder for logic to retrieve a review by ID
        pass

    def get_all_reviews(self):
        # Placeholder for logic to retrieve all reviews
        pass

    def get_reviews_by_place(self, place_id):
        # Placeholder for logic to retrieve all reviews for a specific place
        pass

    def update_review(self, review_id, review_data):
        # Placeholder for logic to update a review
        pass

    def delete_review(self, review_id):
        # Placeholder for logic to delete a review
        pass