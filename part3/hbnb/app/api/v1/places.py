#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.services import facade

api = Namespace('places', description='Place operations')

place_model = api.model('Place', {
    'title': fields.String(required=True),
    'description': fields.String(),
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
})


@api.route('/')
class PlaceList(Resource):
    def get(self):
        places = facade.get_all_places()
        return [
            {
                'id': p.id,
                'title': p.title,
                'price': p.price,
                'latitude': p.latitude,
                'longitude': p.longitude
            }
            for p in places
        ], 200

    @jwt_required()
    @api.expect(place_model)
    def post(self):
        data = api.payload
        try:
            new_place = facade.create_place(data)
            return {
                'id': new_place.id,
                'title': new_place.title,
                'description': new_place.description,
                'price': new_place.price,
                'latitude': new_place.latitude,
                'longitude': new_place.longitude,
            }, 201
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400


@api.route('/<place_id>')
class PlaceResource(Resource):
    def get(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        return {
            'id': place.id,
            'title': place.title,
            'description': place.description,
            'price': place.price,
            'latitude': place.latitude,
            'longitude': place.longitude,
        }, 200

    @jwt_required()
    @api.expect(place_model)
    def put(self, place_id):
        data = api.payload
        try:
            updated = facade.update_place(place_id, data)
            if not updated:
                return {'error': 'Place not found'}, 404
            return {
                'id': updated.id,
                'title': updated.title,
                'description': updated.description,
                'price': updated.price,
                'latitude': updated.latitude,
                'longitude': updated.longitude,
            }, 200
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400