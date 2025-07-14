from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from src.models.user import db, User
from src.models.client import Client, Application, ApplicationDocument, ApplicationStatusHistory
from src.routes.auth import log_user_activity
import uuid
import json
import os
from werkzeug.utils import secure_filename

clients_bp = Blueprint('clients', __name__)

def require_permission(permission_name):
    """Decorator to check user permissions"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            if current_user_id.startswith('client_'):
                return jsonify({'error': 'Access denied'}), 403
            
            user = User.query.get(current_user_id)
            if not user or not user.has_permission(permission_name):
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

@clients_bp.route('/', methods=['GET'])
@jwt_required()
@require_permission('clients.view')
def get_clients():
    """Get all clients with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '')
        country = request.args.get('country', '')
        
        query = Client.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Client.first_name.ilike(f'%{search}%'),
                    Client.last_name.ilike(f'%{search}%'),
                    Client.email.ilike(f'%{search}%'),
                    Client.phone.ilike(f'%{search}%')
                )
            )
        
        if country:
            query = query.filter(Client.country.ilike(f'%{country}%'))
        
        # Order by creation date (newest first)
        query = query.order_by(Client.created_at.desc())
        
        # Paginate
        clients = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'clients': [client.to_dict() for client in clients.items],
            'pagination': {
                'page': page,
                'pages': clients.pages,
                'per_page': per_page,
                'total': clients.total,
                'has_next': clients.has_next,
                'has_prev': clients.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get clients error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/<client_id>', methods=['GET'])
@jwt_required()
@require_permission('clients.view')
def get_client(client_id):
    """Get a specific client by ID"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Include applications
        applications = Application.query.filter_by(client_id=client_id).order_by(Application.submitted_at.desc()).all()
        
        client_data = client.to_dict()
        client_data['applications'] = [app.to_dict() for app in applications]
        
        return jsonify({'client': client_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get client error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/', methods=['POST'])
@jwt_required()
@require_permission('clients.create')
def create_client():
    """Create a new client"""
    try:
        data = request.get_json()
        
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if client already exists
        existing_client = Client.query.filter_by(email=data['email'].lower()).first()
        if existing_client:
            return jsonify({'error': 'Client with this email already exists'}), 400
        
        # Parse date of birth if provided
        date_of_birth = None
        if data.get('date_of_birth'):
            try:
                date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format for date_of_birth. Use YYYY-MM-DD'}), 400
        
        client = Client(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'].lower(),
            phone=data.get('phone'),
            country=data.get('country'),
            passport_number=data.get('passport_number'),
            date_of_birth=date_of_birth,
            nationality=data.get('nationality'),
            address=data.get('address'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            notes=data.get('notes')
        )
        
        db.session.add(client)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_client', 'client', client.id)
        
        return jsonify({
            'message': 'Client created successfully',
            'client': client.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create client error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/<client_id>', methods=['PUT'])
@jwt_required()
@require_permission('clients.edit')
def update_client(client_id):
    """Update a client"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'first_name' in data:
            client.first_name = data['first_name']
        if 'last_name' in data:
            client.last_name = data['last_name']
        if 'email' in data:
            # Check if email is already taken
            existing_client = Client.query.filter_by(email=data['email'].lower()).first()
            if existing_client and existing_client.id != client.id:
                return jsonify({'error': 'Email already exists'}), 400
            client.email = data['email'].lower()
        if 'phone' in data:
            client.phone = data['phone']
        if 'country' in data:
            client.country = data['country']
        if 'passport_number' in data:
            client.passport_number = data['passport_number']
        if 'date_of_birth' in data:
            if data['date_of_birth']:
                try:
                    client.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid date format for date_of_birth. Use YYYY-MM-DD'}), 400
            else:
                client.date_of_birth = None
        if 'nationality' in data:
            client.nationality = data['nationality']
        if 'address' in data:
            client.address = data['address']
        if 'emergency_contact_name' in data:
            client.emergency_contact_name = data['emergency_contact_name']
        if 'emergency_contact_phone' in data:
            client.emergency_contact_phone = data['emergency_contact_phone']
        if 'notes' in data:
            client.notes = data['notes']
        
        client.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_client', 'client', client.id)
        
        return jsonify({
            'message': 'Client updated successfully',
            'client': client.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update client error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/<client_id>', methods=['DELETE'])
@jwt_required()
@require_permission('clients.delete')
def delete_client(client_id):
    """Delete a client (soft delete by marking as inactive)"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Check if client has active applications
        active_applications = Application.query.filter_by(
            client_id=client_id
        ).filter(
            Application.status.in_(['pending', 'processing'])
        ).count()
        
        if active_applications > 0:
            return jsonify({
                'error': 'Cannot delete client with active applications'
            }), 400
        
        # For now, we'll actually delete the client
        # In production, consider soft delete
        db.session.delete(client)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'delete_client', 'client', client_id)
        
        return jsonify({'message': 'Client deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete client error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Application management routes
@clients_bp.route('/<client_id>/applications', methods=['POST'])
@jwt_required()
@require_permission('applications.create')
def create_application(client_id):
    """Create a new application for a client"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        data = request.get_json()
        
        if not data.get('application_type'):
            return jsonify({'error': 'application_type is required'}), 400
        
        # Generate tracking ID
        tracking_id = f"TR{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
        
        application = Application(
            tracking_id=tracking_id,
            client_id=client_id,
            application_type=data['application_type'],
            status='pending',
            priority=data.get('priority', 'normal'),
            application_data=json.dumps(data.get('application_data', {})),
            processing_notes=data.get('processing_notes'),
            estimated_completion=datetime.strptime(data['estimated_completion'], '%Y-%m-%d').date() if data.get('estimated_completion') else None
        )
        
        db.session.add(application)
        db.session.flush()  # Get the application ID
        
        # Create initial status history
        status_history = ApplicationStatusHistory(
            application_id=application.id,
            old_status=None,
            new_status='pending',
            changed_by=get_jwt_identity(),
            notes='Application submitted'
        )
        db.session.add(status_history)
        
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_application', 'application', application.id)
        
        return jsonify({
            'message': 'Application created successfully',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create application error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/applications/<application_id>/status', methods=['PUT'])
@jwt_required()
@require_permission('applications.process')
def update_application_status(application_id):
    """Update application status"""
    try:
        application = Application.query.get(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        notes = data.get('notes', '')
        
        if not new_status:
            return jsonify({'error': 'status is required'}), 400
        
        valid_statuses = ['pending', 'processing', 'approved', 'rejected', 'completed']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        old_status = application.status
        application.status = new_status
        application.updated_at = datetime.utcnow()
        
        # Set completion date if status is completed or approved
        if new_status in ['completed', 'approved'] and not application.actual_completion:
            application.actual_completion = datetime.utcnow().date()
        
        # Create status history
        status_history = ApplicationStatusHistory(
            application_id=application.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=get_jwt_identity(),
            notes=notes
        )
        db.session.add(status_history)
        
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_application_status', 'application', application.id, 
                         f"Status changed from {old_status} to {new_status}")
        
        return jsonify({
            'message': 'Application status updated successfully',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update application status error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@clients_bp.route('/applications/track/<tracking_id>', methods=['GET'])
def track_application(tracking_id):
    """Track application by tracking ID (public endpoint)"""
    try:
        application = Application.query.filter_by(tracking_id=tracking_id).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Get status history
        status_history = ApplicationStatusHistory.query.filter_by(
            application_id=application.id
        ).order_by(ApplicationStatusHistory.changed_at.asc()).all()
        
        app_data = application.to_dict()
        app_data['status_history'] = [history.to_dict() for history in status_history]
        
        # Include client basic info
        client = Client.query.get(application.client_id)
        app_data['client'] = {
            'first_name': client.first_name,
            'last_name': client.last_name,
            'email': client.email
        }
        
        return jsonify({'application': app_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Track application error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

