import os
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from src.models.user import db, User, Role, Permission, AuditLog
from src.models.client import Client
import uuid
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

auth_bp = Blueprint('auth', __name__)

def log_user_activity(user_id, action, resource_type, resource_id=None, details=None):
    """Log user activity for audit purposes"""
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log activity: {str(e)}")

from flask_jwt_extended import create_access_token, create_refresh_token
import bcrypt

from flask_jwt_extended import create_access_token, create_refresh_token
import bcrypt

@auth_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        email = data['email'].lower()
        password = data['password']

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            
            log_user_activity(user.id, 'login', 'auth')

            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500






# Client authentication (for frontend users)
@auth_bp.route('/client/register', methods=['POST'])
def client_register():
    """Register a new client using Supabase"""
    try:
        data = request.get_json()

        required_fields = ['first_name', 'last_name', 'email', 'phone', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        email = data['email'].lower()
        password = data['password']
        first_name = data['first_name']
        last_name = data['last_name']

        # Sign up with Supabase
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone": data.get('phone'),
                    "country": data.get('country'),
                    "passport_number": data.get('passport_number'),
                    "nationality": data.get('nationality'),
                    "address": data.get('address')
                }
            }
        })

        if response.error:
            return jsonify({'error': response.error.message}), 400

        # Get user from Supabase
        user = response.user

        # Create new user in local database
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=hashed_password,
            is_active=True,
            is_verified=True
        )
        db.session.add(new_user)
        db.session.commit()

        # Create new client in local database
        client = Client(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=data.get('phone'),
            country=data.get('country'),
            passport_number=data.get('passport_number'),
            nationality=data.get('nationality'),
            address=data.get('address')
        )

        db.session.add(client)
        db.session.commit()

        return jsonify({
            'message': 'Client registered successfully',
            'client': client.to_dict()
        }), 201

    except Exception as e:
        current_app.logger.error(f"Client registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/client/login', methods=['POST'])
def client_login():
    """Client login using Supabase"""
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        email = data['email'].lower()
        password = data['password']

        # Sign in with Supabase
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})

        if response.error:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Get user from Supabase
        user = response.user

        return jsonify({
            'access_token': response.session.access_token,
            'client': {
                'id': user.id,
                'email': user.email,
                'first_name': user.user_metadata.get('first_name'),
                'last_name': user.user_metadata.get('last_name'),
                'phone': user.user_metadata.get('phone'),
                'country': user.user_metadata.get('country'),
                'passport_number': user.user_metadata.get('passport_number'),
                'nationality': user.user_metadata.get('nationality'),
                'address': user.user_metadata.get('address')
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Client login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
