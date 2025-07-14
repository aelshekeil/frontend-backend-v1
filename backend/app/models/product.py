from src.models.user import db
from datetime import datetime
import uuid

class ProductCategory(db.Model):
    __tablename__ = 'product_categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    parent_id = db.Column(db.String(36), db.ForeignKey('product_categories.id'))
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for subcategories
    children = db.relationship('ProductCategory', backref=db.backref('parent', remote_side=[id]))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'parent_id': self.parent_id,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    description = db.Column(db.Text)
    short_description = db.Column(db.Text)
    sku = db.Column(db.String(100), unique=True)
    product_type = db.Column(db.String(50), nullable=False)  # esim, service, physical
    category_id = db.Column(db.String(36), db.ForeignKey('product_categories.id'))
    
    # Pricing
    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost_price = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(3), default='USD')
    
    # Inventory (for physical products)
    track_inventory = db.Column(db.Boolean, default=False)
    stock_quantity = db.Column(db.Integer, default=0)
    low_stock_threshold = db.Column(db.Integer, default=5)
    
    # Media
    featured_image = db.Column(db.String(500))
    gallery_images = db.Column(db.Text)  # JSON array
    
    # Product attributes (JSON for flexibility)
    attributes = db.Column(db.Text)  # JSON object
    
    # SEO
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.Text)
    
    # Status
    status = db.Column(db.String(20), default='active')  # active, inactive, discontinued
    is_featured = db.Column(db.Boolean, default=False)
    is_digital = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('ProductCategory', backref='products')
    variants = db.relationship('ProductVariant', backref='product', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'sku': self.sku,
            'product_type': self.product_type,
            'category_id': self.category_id,
            'price': float(self.price) if self.price else None,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'currency': self.currency,
            'track_inventory': self.track_inventory,
            'stock_quantity': self.stock_quantity,
            'low_stock_threshold': self.low_stock_threshold,
            'featured_image': self.featured_image,
            'gallery_images': self.gallery_images,
            'attributes': self.attributes,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'status': self.status,
            'is_featured': self.is_featured,
            'is_digital': self.is_digital,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    sku = db.Column(db.String(100), unique=True)
    
    # Pricing (can override product price)
    price = db.Column(db.Numeric(10, 2))
    cost_price = db.Column(db.Numeric(10, 2))
    
    # Inventory
    stock_quantity = db.Column(db.Integer, default=0)
    
    # Variant attributes (e.g., data allowance for eSIMs, validity period)
    attributes = db.Column(db.Text)  # JSON object
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'name': self.name,
            'sku': self.sku,
            'price': float(self.price) if self.price else None,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'stock_quantity': self.stock_quantity,
            'attributes': self.attributes,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ESIMProduct(db.Model):
    __tablename__ = 'esim_products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    
    # eSIM specific attributes
    countries = db.Column(db.Text, nullable=False)  # JSON array of country codes
    regions = db.Column(db.Text)  # JSON array of regions
    data_allowance_mb = db.Column(db.Integer, nullable=False)
    validity_days = db.Column(db.Integer, nullable=False)
    network_type = db.Column(db.String(10), default='4G')  # 3G, 4G, 5G
    is_unlimited = db.Column(db.Boolean, default=False)
    is_renewable = db.Column(db.Boolean, default=False)
    activation_policy = db.Column(db.String(50))  # immediate, manual, first_use
    
    # Provider information
    provider_name = db.Column(db.String(100))
    provider_id = db.Column(db.String(100))  # External provider reference
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', backref='esim_details')
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'countries': self.countries,
            'regions': self.regions,
            'data_allowance_mb': self.data_allowance_mb,
            'validity_days': self.validity_days,
            'network_type': self.network_type,
            'is_unlimited': self.is_unlimited,
            'is_renewable': self.is_renewable,
            'activation_policy': self.activation_policy,
            'provider_name': self.provider_name,
            'provider_id': self.provider_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    
    # Order totals
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='USD')
    
    # Order status
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, cancelled, refunded
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, failed, refunded
    fulfillment_status = db.Column(db.String(20), default='pending')  # pending, processing, fulfilled, cancelled
    
    # Payment information
    payment_method = db.Column(db.String(50))
    payment_reference = db.Column(db.String(100))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = db.relationship('Client', backref='orders')
    items = db.relationship('OrderItem', backref='order', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'client_id': self.client_id,
            'subtotal': float(self.subtotal),
            'tax_amount': float(self.tax_amount),
            'discount_amount': float(self.discount_amount),
            'total_amount': float(self.total_amount),
            'currency': self.currency,
            'status': self.status,
            'payment_status': self.payment_status,
            'fulfillment_status': self.fulfillment_status,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.String(36), db.ForeignKey('product_variants.id'))
    
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Product snapshot (in case product details change)
    product_name = db.Column(db.String(200), nullable=False)
    product_sku = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', backref='order_items')
    variant = db.relationship('ProductVariant', backref='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price),
            'product_name': self.product_name,
            'product_sku': self.product_sku,
            'created_at': self.created_at.isoformat()
        }

