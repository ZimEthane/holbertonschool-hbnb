from flask_restx import Namespace, Resource, fields
from app.services.facade import HBnBFacade

api = Namespace('places', description='Place operations')
facade = HBnBFacade()

place_model = api.model('Place', {
    'title': fields.String(required=True),
    'description': fields.String,
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'owner_id': fields.String(required=True),
    'amenities': fields.List(fields.String)
})

@api.route('/')
class PlaceList(Resource):

    @api.expect(place_model)
    def post(self):
        data = api.payload
        try:
            place = facade.create_place(data)
        except Exception as e:
            return {"message": str(e)}, 400

        return {
            "id": place.id,
            "title": place.title,
            "description": place.description,
            "price": place.price,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "owner_id": place.owner_id
        }, 201

    def get(self):
        places = facade.get_all_places()
        return [
            {
                "id": p.id,
                "title": p.title,
                "latitude": p.latitude,
                "longitude": p.longitude
            }
            for p in places
        ], 200


@api.route('/<place_id>')
class PlaceResource(Resource):

    def get(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        owner = facade.users.get(place.owner_id)

        return {
            "id": place.id,
            "title": place.title,
            "description": place.description,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "owner": {
                "id": owner.id,
                "first_name": owner.first_name,
                "last_name": owner.last_name,
                "email": owner.email
            },
            "amenities": [
                {
                    "id": a.id,
                    "name": a.name
                }
                for a in place.amenities
            ]
        }, 200

    @api.expect(place_model)
    def put(self, place_id):
        data = api.payload
        try:
            place = facade.update_place(place_id, data)
            if not place:
                return {"message": "Place not found"}, 404
        except Exception as e:
            return {"message": str(e)}, 400

        return {"message": "Place updated successfully"}, 200

@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        # Placeholder for logic to return a list of reviews for a place
        pass
