from app.persistence.repository import InMemoryRepository

class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

   def create_user(self, user_data):
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)

    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
        # Logic will be implemented in later tasks
        pass

def create_amenity(self, amenity_data):
        if "name" not in amenity_data:
            raise ValueError("Missing name")

        # Validation faite dans le modèle
        new_amenity = Amenity(name=amenity_data["name"])

        # Ajout au repository
        self.amenity_repo.add(new_amenity)

        return new_amenity

    def get_amenity(self, amenity_id):
        amenity = self.amenity_repo.get(amenity_id)

        if amenity is None:
            raise ValueError("Amenity not found")

        return amenity

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)

        if amenity is None:
            raise ValueError("Amenity not found")

        if "name" in amenity_data:
            amenity.name = amenity_data["name"]

        self.amenity_repo.update(amenity_id, amenity)

        return amenity
