from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api.bookings import bookings_bp
from app.services.booking_service import BookingService
from app.utils.validators import validate_booking_data

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    errors = validate_booking_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    user_id = get_jwt_identity()
    response, status_code = BookingService.create_booking(data, user_id)
    return jsonify(response), status_code

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookings():
    user_id = get_jwt_identity()
    response, status_code = BookingService.get_user_bookings(user_id)
    return jsonify(response), status_code
