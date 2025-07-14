from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from src.models.user import db, User, Role, Permission, AuditLog
from src.models.client import Client, Application
from src.models.content import Post, TravelPackage
from src.models.product import Product, Order
from src.routes.auth import log_user_activity
import bcrypt

admin_bp = Blueprint('admin', __name__)

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

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        current_user_id = get_jwt_identity()
        if current_user_id.startswith('client_'):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get date ranges
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Basic counts
        stats = {
            'clients': {
                'total': Client.query.count(),
                'new_this_week': Client.query.filter(Client.created_at >= week_ago).count(),
                'new_this_month': Client.query.filter(Client.created_at >= month_ago).count()
            },
            'applications': {
                'total': Application.query.count(),
                'pending': Application.query.filter_by(status='pending').count(),
                'processing': Application.query.filter_by(status='processing').count(),
                'completed': Application.query.filter_by(status='completed').count(),
                'new_this_week': Application.query.filter(Application.submitted_at >= week_ago).count()
            },
            'content': {
                'posts': Post.query.count(),
                'published_posts': Post.query.filter_by(status='published').count(),
                'travel_packages': TravelPackage.query.filter_by(is_active=True).count(),
                'featured_packages': TravelPackage.query.filter_by(is_featured=True, is_active=True).count()
            },
            'products': {
                'total': Product.query.filter_by(status='active').count(),
                'esims': Product.query.filter_by(product_type='esim', status='active').count(),
                'services': Product.query.filter_by(product_type='service', status='active').count(),
                'featured': Product.query.filter_by(is_featured=True, status='active').count()
            },
            'orders': {
                'total': Order.query.count(),
                'pending': Order.query.filter_by(status='pending').count(),
                'completed': Order.query.filter_by(status='completed').count(),
                'this_month': Order.query.filter(Order.created_at >= month_ago).count()
            }
        }
        
        # Recent applications
        recent_applications = Application.query.order_by(desc(Application.submitted_at)).limit(5).all()
        stats['recent_applications'] = [app.to_dict() for app in recent_applications]
        
        # Application status distribution
        status_distribution = db.session.query(
            Application.status,
            func.count(Application.id).label('count')
        ).group_by(Application.status).all()
        
        stats['application_status_distribution'] = [
            {'status': status, 'count': count} for status, count in status_distribution
        ]
        
        # Monthly application trends (last 6 months)
        monthly_trends = []
        for i in range(6):
            month_start = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            
            count = Application.query.filter(
                Application.submitted_at >= month_start,
                Application.submitted_at < next_month
            ).count()
            
            monthly_trends.append({
                'month': month_start.strftime('%Y-%m'),
                'count': count
            })
        
        stats['monthly_application_trends'] = list(reversed(monthly_trends))
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get dashboard stats error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# User management routes
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_permission('users.view')
def get_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        users = User.query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': page,
                'pages': users.pages,
                'per_page': per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get users error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@require_permission('users.create')
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'first_name', 'last_name', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email'].lower()).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate password
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        user = User(
            email=data['email'].lower(),
            first_name=data['first_name'],
            last_name=data['last_name'],
            is_active=data.get('is_active', True),
            is_verified=data.get('is_verified', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Get the user ID
        
        # Assign roles if provided
        if data.get('role_ids'):
            for role_id in data['role_ids']:
                role = Role.query.get(role_id)
                if role:
                    user.roles.append(role)
        
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_user', 'user', user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
@require_permission('users.edit')
def update_user(user_id):
    """Update a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update basic fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email'].lower()).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email'].lower()
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_verified' in data:
            user.is_verified = data['is_verified']
        
        # Update password if provided
        if data.get('password'):
            if len(data['password']) < 8:
                return jsonify({'error': 'Password must be at least 8 characters long'}), 400
            user.set_password(data['password'])
        
        # Update roles if provided
        if 'role_ids' in data:
            user.roles.clear()
            for role_id in data['role_ids']:
                role = Role.query.get(role_id)
                if role:
                    user.roles.append(role)
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_user', 'user', user.id)
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
@require_permission('users.delete')
def delete_user(user_id):
    """Delete a user (deactivate)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        current_user_id = get_jwt_identity()
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Deactivate instead of deleting
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_user_activity(current_user_id, 'delete_user', 'user', user_id)
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Role and permission management
@admin_bp.route('/roles', methods=['GET'])
@jwt_required()
@require_permission('users.view')
def get_roles():
    """Get all roles"""
    try:
        roles = Role.query.order_by(Role.name).all()
        return jsonify({
            'roles': [role.to_dict() for role in roles]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get roles error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/permissions', methods=['GET'])
@jwt_required()
@require_permission('users.view')
def get_permissions():
    """Get all permissions grouped by module"""
    try:
        permissions = Permission.query.order_by(Permission.module, Permission.name).all()
        
        # Group by module
        grouped_permissions = {}
        for permission in permissions:
            if permission.module not in grouped_permissions:
                grouped_permissions[permission.module] = []
            grouped_permissions[permission.module].append(permission.to_dict())
        
        return jsonify({
            'permissions': grouped_permissions
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get permissions error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Audit log routes
@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@require_permission('system.audit')
def get_audit_logs():
    """Get audit logs with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        user_id = request.args.get('user_id', '')
        action = request.args.get('action', '')
        resource_type = request.args.get('resource_type', '')
        
        query = AuditLog.query
        
        # Apply filters
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        if action:
            query = query.filter(AuditLog.action.ilike(f'%{action}%'))
        
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        
        # Order by creation date (newest first)
        query = query.order_by(desc(AuditLog.created_at))
        
        # Paginate
        logs = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'pagination': {
                'page': page,
                'pages': logs.pages,
                'per_page': per_page,
                'total': logs.total,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get audit logs error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# System settings routes
@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@require_permission('system.settings')
def get_settings():
    """Get system settings"""
    try:
        # For now, return basic system info
        # In production, implement a proper settings table
        settings = {
            'system_name': 'Tarim Tours Backend',
            'version': '1.0.0',
            'environment': 'development',
            'database_url': current_app.config.get('SQLALCHEMY_DATABASE_URI', '').split('/')[-1],
            'features': {
                'client_management': True,
                'content_management': True,
                'product_management': True,
                'order_management': True,
                'multi_admin': True,
                'audit_logging': True
            }
        }
        
        return jsonify({'settings': settings}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get settings error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/system/health', methods=['GET'])
def system_health():
    """System health check endpoint"""
    try:
        # Check database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        
        # Get basic stats
        health_info = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected',
            'version': '1.0.0',
            'uptime': 'N/A'  # Would need to track application start time
        }
        
        return jsonify(health_info), 200
        
    except Exception as e:
        current_app.logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

