from flask import Flask
from flask_restx import Api
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.places import api as places_ns

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    
    app.config.from_object(config_class)

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/')

    # Register the users namespace
    api.add_namespace(users_ns, path='/users')
    api.add_namespace(amenities_ns, path='/amenities')
    api.add_namespace(places_ns, path='/places')
    api.add_namespace(reviews_ns, path='/reviews')
    
    return app