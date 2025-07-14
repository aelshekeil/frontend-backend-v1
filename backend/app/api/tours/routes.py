from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.tour_service import TourService
from app.utils.validators import validate_tour_data
from app.utils.decorators import handle_exceptions

tours_bp = Blueprint('tours', __name__)

@tours_bp.route('/', methods=['GET'])
@handle_exceptions
def get_tours():
    """Get all tours with optional filtering"""
    filters = {
        'destination': request.args.get('destination'),
        'price_min': request.args.get('price_min', type=int),
        'price_max': request.args.get('price_max', type=int),
        'duration': request.args.get('duration', type=int)
    }
    tours = TourService.get_tours(filters)
    return jsonify({
        'success': True,
        'data': tours,
        'count': len(tours)
    })

@tours_bp.route('/', methods=['POST'])
@jwt_required()
@handle_exceptions
def create_tour():
    """Create a new tour (admin only)"""
    data = request.get_json()
    # Validate input data
    validation_errors = validate_tour_data(data)
    if validation_errors:
        return jsonify({
            'success': False,
            'errors': validation_errors
        }), 400
    
    tour = TourService.create_tour(data, get_jwt_identity())
    return jsonify({
        'success': True,
        'data': tour
    }), 201
