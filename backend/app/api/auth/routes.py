from flask import request, jsonify
from app.api.auth import auth_bp
from app.services.auth_service import AuthService
from app.utils.validators import validate_user_data, validate_login_data

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = validate_user_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    response, status_code = AuthService.register_user(data)
    return jsonify(response), status_code

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    errors = validate_login_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
        
    response, status_code = AuthService.login_user(data)
    return jsonify(response), status_code
