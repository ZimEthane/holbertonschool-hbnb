# api/v1/amenities.py
from flask_restx import Namespace, Resource, fields
from app.services.facade import HBnBFacade

api = Namespace('amenities', description='Amenity operations')

# Façade singleton
facade = HBnBFacade()

# Définition du modèle pour Swagger / validation
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})

@api.route('/')
class AmenityList(Resource):
    @api.expect(amenity_model)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new amenity"""
        data = api.payload
        if not data or 'name' not in data:
            return {'message': 'Invalid input data'}, 400
        try:
            amenity = facade.create_amenity(data)
        except ValueError as e:
            return {'message': str(e)}, 400
        return {'id': amenity.id, 'name': amenity.name}, 201

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Retrieve a list of all amenities"""
        amenities = facade.get_all_amenities()
        result = [{'id': a.id, 'name': a.name} for a in amenities]
        return result, 200

@api.route('/<amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Get amenity details by ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'message': 'Amenity not found'}, 404
        return {'id': amenity.id, 'name': amenity.name}, 200

    @api.expect(amenity_model)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    def put(self, amenity_id):
        """Update an amenity's information"""
        data = api.payload
        if not data or 'name' not in data:
            return {'message': 'Invalid input data'}, 400
        try:
            amenity = facade.update_amenity(amenity_id, data)
        except ValueError as e:
            return {'message': str(e)}, 400
        if not amenity:
            return {'message': 'Amenity not found'}, 404
        return {'message': 'Amenity updated successfully'}, 200
