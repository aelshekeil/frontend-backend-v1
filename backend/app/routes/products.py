from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db, User
from src.models.product import Product, ProductCategory, ProductVariant, ESIMProduct, Order, OrderItem
from src.models.client import Client
from src.routes.auth import log_user_activity
import json
import re
import uuid

products_bp = Blueprint('products', __name__)

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

def generate_slug(name):
    """Generate URL-friendly slug from name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def generate_sku():
    """Generate unique SKU"""
    return f"TR{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"

# Product management routes
@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all products with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        category_id = request.args.get('category_id', '')
        product_type = request.args.get('product_type', '')
        status = request.args.get('status', '')
        featured = request.args.get('featured', '')
        
        query = Product.query
        
        # Apply filters
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if product_type:
            query = query.filter(Product.product_type == product_type)
        
        if status:
            query = query.filter(Product.status == status)
        else:
            # Default to active products for public access
            query = query.filter(Product.status == 'active')
        
        if featured:
            query = query.filter(Product.is_featured == (featured.lower() == 'true'))
        
        # Order by featured first, then by creation date
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
        
        # Paginate
        products = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'pagination': {
                'page': page,
                'pages': products.pages,
                'per_page': per_page,
                'total': products.total,
                'has_next': products.has_next,
                'has_prev': products.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get products error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID or slug"""
    try:
        # Try to find by ID first, then by slug
        product = Product.query.get(product_id)
        if not product:
            product = Product.query.filter_by(slug=product_id).first()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if product is active (unless user is authenticated admin)
        auth_header = request.headers.get('Authorization')
        if not auth_header and product.status != 'active':
            return jsonify({'error': 'Product not found'}), 404
        
        product_data = product.to_dict()
        
        # Include variants
        variants = ProductVariant.query.filter_by(product_id=product.id, is_active=True).order_by(ProductVariant.sort_order).all()
        product_data['variants'] = [variant.to_dict() for variant in variants]
        
        # Include eSIM details if it's an eSIM product
        if product.product_type == 'esim':
            esim_details = ESIMProduct.query.filter_by(product_id=product.id).first()
            if esim_details:
                product_data['esim_details'] = esim_details.to_dict()
        
        return jsonify({'product': product_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get product error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/', methods=['POST'])
@jwt_required()
@require_permission('products.create')
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'product_type', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate slug and SKU
        slug = data.get('slug') or generate_slug(data['name'])
        sku = data.get('sku') or generate_sku()
        
        # Check if slug or SKU already exists
        existing_product = Product.query.filter(
            db.or_(Product.slug == slug, Product.sku == sku)
        ).first()
        if existing_product:
            if existing_product.slug == slug:
                slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
            if existing_product.sku == sku:
                sku = generate_sku()
        
        product = Product(
            name=data['name'],
            slug=slug,
            description=data.get('description'),
            short_description=data.get('short_description'),
            sku=sku,
            product_type=data['product_type'],
            category_id=data.get('category_id'),
            price=data['price'],
            cost_price=data.get('cost_price'),
            currency=data.get('currency', 'USD'),
            track_inventory=data.get('track_inventory', False),
            stock_quantity=data.get('stock_quantity', 0),
            low_stock_threshold=data.get('low_stock_threshold', 5),
            featured_image=data.get('featured_image'),
            gallery_images=json.dumps(data.get('gallery_images', [])),
            attributes=json.dumps(data.get('attributes', {})),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
            status=data.get('status', 'active'),
            is_featured=data.get('is_featured', False),
            is_digital=data.get('is_digital', True)
        )
        
        db.session.add(product)
        db.session.flush()  # Get the product ID
        
        # Create eSIM details if it's an eSIM product
        if data['product_type'] == 'esim' and data.get('esim_details'):
            esim_data = data['esim_details']
            esim_product = ESIMProduct(
                product_id=product.id,
                countries=json.dumps(esim_data.get('countries', [])),
                regions=json.dumps(esim_data.get('regions', [])),
                data_allowance_mb=esim_data.get('data_allowance_mb', 0),
                validity_days=esim_data.get('validity_days', 30),
                network_type=esim_data.get('network_type', '4G'),
                is_unlimited=esim_data.get('is_unlimited', False),
                is_renewable=esim_data.get('is_renewable', False),
                activation_policy=esim_data.get('activation_policy', 'immediate'),
                provider_name=esim_data.get('provider_name'),
                provider_id=esim_data.get('provider_id')
            )
            db.session.add(esim_product)
        
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_product', 'product', product.id)
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create product error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
@require_permission('products.edit')
def update_product(product_id):
    """Update a product"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'slug' in data:
            existing_product = Product.query.filter_by(slug=data['slug']).filter(Product.id != product.id).first()
            if existing_product:
                return jsonify({'error': 'Slug already exists'}), 400
            product.slug = data['slug']
        if 'description' in data:
            product.description = data['description']
        if 'short_description' in data:
            product.short_description = data['short_description']
        if 'sku' in data:
            existing_product = Product.query.filter_by(sku=data['sku']).filter(Product.id != product.id).first()
            if existing_product:
                return jsonify({'error': 'SKU already exists'}), 400
            product.sku = data['sku']
        if 'category_id' in data:
            product.category_id = data['category_id']
        if 'price' in data:
            product.price = data['price']
        if 'cost_price' in data:
            product.cost_price = data['cost_price']
        if 'currency' in data:
            product.currency = data['currency']
        if 'track_inventory' in data:
            product.track_inventory = data['track_inventory']
        if 'stock_quantity' in data:
            product.stock_quantity = data['stock_quantity']
        if 'low_stock_threshold' in data:
            product.low_stock_threshold = data['low_stock_threshold']
        if 'featured_image' in data:
            product.featured_image = data['featured_image']
        if 'gallery_images' in data:
            product.gallery_images = json.dumps(data['gallery_images'])
        if 'attributes' in data:
            product.attributes = json.dumps(data['attributes'])
        if 'meta_title' in data:
            product.meta_title = data['meta_title']
        if 'meta_description' in data:
            product.meta_description = data['meta_description']
        if 'status' in data:
            product.status = data['status']
        if 'is_featured' in data:
            product.is_featured = data['is_featured']
        if 'is_digital' in data:
            product.is_digital = data['is_digital']
        
        # Update eSIM details if provided
        if product.product_type == 'esim' and data.get('esim_details'):
            esim_product = ESIMProduct.query.filter_by(product_id=product.id).first()
            esim_data = data['esim_details']
            
            if esim_product:
                # Update existing eSIM details
                if 'countries' in esim_data:
                    esim_product.countries = json.dumps(esim_data['countries'])
                if 'regions' in esim_data:
                    esim_product.regions = json.dumps(esim_data['regions'])
                if 'data_allowance_mb' in esim_data:
                    esim_product.data_allowance_mb = esim_data['data_allowance_mb']
                if 'validity_days' in esim_data:
                    esim_product.validity_days = esim_data['validity_days']
                if 'network_type' in esim_data:
                    esim_product.network_type = esim_data['network_type']
                if 'is_unlimited' in esim_data:
                    esim_product.is_unlimited = esim_data['is_unlimited']
                if 'is_renewable' in esim_data:
                    esim_product.is_renewable = esim_data['is_renewable']
                if 'activation_policy' in esim_data:
                    esim_product.activation_policy = esim_data['activation_policy']
                if 'provider_name' in esim_data:
                    esim_product.provider_name = esim_data['provider_name']
                if 'provider_id' in esim_data:
                    esim_product.provider_id = esim_data['provider_id']
                
                esim_product.updated_at = datetime.utcnow()
        
        product.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_product', 'product', product.id)
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update product error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
@require_permission('products.delete')
def delete_product(product_id):
    """Delete a product (soft delete by marking as inactive)"""
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Soft delete by marking as inactive
        product.status = 'discontinued'
        product.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'delete_product', 'product', product_id)
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete product error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Product Category management routes
@products_bp.route('/categories', methods=['GET'])
def get_product_categories():
    """Get all product categories"""
    try:
        categories = ProductCategory.query.filter_by(is_active=True).order_by(ProductCategory.sort_order, ProductCategory.name).all()
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get product categories error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/categories', methods=['POST'])
@jwt_required()
@require_permission('products.create')
def create_product_category():
    """Create a new product category"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'name is required'}), 400
        
        slug = data.get('slug') or generate_slug(data['name'])
        
        # Check if name or slug already exists
        existing_category = ProductCategory.query.filter(
            db.or_(ProductCategory.name == data['name'], ProductCategory.slug == slug)
        ).first()
        if existing_category:
            return jsonify({'error': 'Category name or slug already exists'}), 400
        
        category = ProductCategory(
            name=data['name'],
            slug=slug,
            description=data.get('description'),
            parent_id=data.get('parent_id'),
            sort_order=data.get('sort_order', 0)
        )
        
        db.session.add(category)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_product_category', 'product_category', category.id)
        
        return jsonify({
            'message': 'Product category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create product category error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Order management routes
@products_bp.route('/orders', methods=['GET'])
@jwt_required()
@require_permission('products.view')
def get_orders():
    """Get all orders with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        status = request.args.get('status', '')
        client_id = request.args.get('client_id', '')
        
        query = Order.query
        
        # Apply filters
        if status:
            query = query.filter(Order.status == status)
        
        if client_id:
            query = query.filter(Order.client_id == client_id)
        
        # Order by creation date (newest first)
        query = query.order_by(Order.created_at.desc())
        
        # Paginate
        orders = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'orders': [order.to_dict() for order in orders.items],
            'pagination': {
                'page': page,
                'pages': orders.pages,
                'per_page': per_page,
                'total': orders.total,
                'has_next': orders.has_next,
                'has_prev': orders.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get orders error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order (public endpoint for frontend)"""
    try:
        data = request.get_json()
        
        required_fields = ['client_id', 'items']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify client exists
        client = Client.query.get(data['client_id'])
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Generate order number
        order_number = f"ORD{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate totals
        subtotal = 0
        order_items = []
        
        for item_data in data['items']:
            product = Product.query.get(item_data['product_id'])
            if not product or product.status != 'active':
                return jsonify({'error': f'Product {item_data["product_id"]} not found or inactive'}), 400
            
            quantity = item_data.get('quantity', 1)
            unit_price = product.price
            
            # Check for variant pricing
            if item_data.get('variant_id'):
                variant = ProductVariant.query.get(item_data['variant_id'])
                if variant and variant.price:
                    unit_price = variant.price
            
            total_price = unit_price * quantity
            subtotal += total_price
            
            order_items.append({
                'product_id': product.id,
                'variant_id': item_data.get('variant_id'),
                'quantity': quantity,
                'unit_price': unit_price,
                'total_price': total_price,
                'product_name': product.name,
                'product_sku': product.sku
            })
        
        # Apply discount if provided
        discount_amount = data.get('discount_amount', 0)
        tax_amount = data.get('tax_amount', 0)
        total_amount = subtotal - discount_amount + tax_amount
        
        # Create order
        order = Order(
            order_number=order_number,
            client_id=data['client_id'],
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            currency=data.get('currency', 'USD'),
            payment_method=data.get('payment_method'),
            payment_reference=data.get('payment_reference')
        )
        
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        # Create order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create order error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/orders/<order_id>/status', methods=['PUT'])
@jwt_required()
@require_permission('products.edit')
def update_order_status(order_id):
    """Update order status"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json()
        
        if 'status' in data:
            order.status = data['status']
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        if 'fulfillment_status' in data:
            order.fulfillment_status = data['fulfillment_status']
        
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_order_status', 'order', order.id)
        
        return jsonify({
            'message': 'Order status updated successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update order status error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

