#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('places', description='Place operations')

place_model = api.model('Place', {
    'title': fields.String(required=True),
    'description': fields.String(),
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'amenities': fields.List(fields.String),
})

update_place_model = api.model('UpdatePlace', {
    'title': fields.String(),
    'description': fields.String(),
    'price': fields.Float(),
    'latitude': fields.Float(),
    'longitude': fields.Float(),
    'amenities': fields.List(fields.String),
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
                'longitude': p.longitude,
                'description': p.description,
                'owner_id': p.owner_id,
                'owner_name': f"{p.owner.first_name} {p.owner.last_name}" if p.owner else 'Unknown'
            }
            for p in places
        ], 200

    @jwt_required()
    @api.expect(place_model)
    def post(self):
        current_user_id = get_jwt_identity()
        data = api.payload
        data['owner_id'] = current_user_id
        try:
            new_place = facade.create_place(data)
            return {
                'id': new_place.id,
                'title': new_place.title,
                'description': new_place.description,
                'price': new_place.price,
                'latitude': new_place.latitude,
                'longitude': new_place.longitude,
                'owner_id': new_place.owner_id
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
            'owner_id': place.owner_id,
            'owner_name': f"{place.owner.first_name} {place.owner.last_name}" if place.owner else 'Unknown',
            'amenities': [a.id for a in place.amenities]
        }, 200

    @jwt_required()
    @api.expect(update_place_model)
    def put(self, place_id):
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        if not is_admin and place.owner_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        data = api.payload
        try:
            updated = facade.update_place(place_id, data)
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

    @jwt_required()
    def delete(self, place_id):
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        if not is_admin and place.owner_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        try:
            facade.delete_place(place_id)
            return {'message': 'Place deleted successfully'}, 200
        except ValueError as e:
            return {"error": str(e)}, 400


@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    def get(self, place_id):
        try:
            reviews = facade.get_reviews_by_place(place_id)
            return [
                {
                    'id': r.id,
                    'text': r.text,
                    'rating': r.rating,
                    'user_id': r.user_id
                }
                for r in reviews
            ], 200
        except ValueError:
            return {'error': 'Place not found'}, 404