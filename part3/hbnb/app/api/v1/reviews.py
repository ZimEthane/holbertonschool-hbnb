#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.services import facade

api = Namespace('reviews', description='Review operations')

review_model = api.model('Review', {
    'text': fields.String(required=True),
    'rating': fields.Integer(required=True),
})


@api.route('/')
class ReviewList(Resource):
    def get(self):
        reviews = facade.get_all_reviews()
        return [
            {'id': r.id, 'text': r.text, 'rating': r.rating}
            for r in reviews
        ], 200

    @jwt_required()
    @api.expect(review_model)
    def post(self):
        data = api.payload
        try:
            new_review = facade.create_review(data)
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
            }, 201
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400


@api.route('/<review_id>')
class ReviewResource(Resource):
    def get(self, review_id):
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return {'id': review.id, 'text': review.text, 'rating': review.rating}, 200

    @jwt_required()
    @api.expect(review_model)
    def put(self, review_id):
        data = api.payload
        try:
            updated = facade.update_review(review_id, data)
            if not updated:
                return {'error': 'Review not found'}, 404
            return {'id': updated.id, 'text': updated.text, 'rating': updated.rating}, 200
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400

    @jwt_required()
    def delete(self, review_id):
        success = facade.delete_review(review_id)
        if success:
            return {'message': 'Review deleted successfully'}, 200
        return {'error': 'Review not found'}, 404