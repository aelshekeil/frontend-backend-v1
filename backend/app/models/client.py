from src.models.user import db
from datetime import datetime
import uuid

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    country = db.Column(db.String(100))
    passport_number = db.Column(db.String(50))
    date_of_birth = db.Column(db.Date)
    nationality = db.Column(db.String(100))
    address = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='client', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'country': self.country,
            'passport_number': self.passport_number,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'nationality': self.nationality,
            'address': self.address,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_id = db.Column(db.String(20), unique=True, nullable=False)
    client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    application_type = db.Column(db.String(50), nullable=False)  # visa, driving_license, business_incorporation
    status = db.Column(db.String(20), default='pending')  # pending, processing, approved, rejected, completed
    priority = db.Column(db.String(10), default='normal')  # low, normal, high, urgent
    
    # Application specific data (JSON field for flexibility)
    application_data = db.Column(db.Text)  # JSON string
    
    # Processing information
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'))
    processing_notes = db.Column(db.Text)
    estimated_completion = db.Column(db.Date)
    actual_completion = db.Column(db.Date)
    
    # Timestamps
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assigned_user = db.relationship('User', backref='assigned_applications')
    documents = db.relationship('ApplicationDocument', backref='application', lazy=True)
    status_history = db.relationship('ApplicationStatusHistory', backref='application', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tracking_id': self.tracking_id,
            'client_id': self.client_id,
            'application_type': self.application_type,
            'status': self.status,
            'priority': self.priority,
            'application_data': self.application_data,
            'assigned_to': self.assigned_to,
            'processing_notes': self.processing_notes,
            'estimated_completion': self.estimated_completion.isoformat() if self.estimated_completion else None,
            'actual_completion': self.actual_completion.isoformat() if self.actual_completion else None,
            'submitted_at': self.submitted_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ApplicationDocument(db.Model):
    __tablename__ = 'application_documents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = db.Column(db.String(36), db.ForeignKey('applications.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # passport, photo, etc.
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'document_type': self.document_type,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_at': self.uploaded_at.isoformat()
        }

class ApplicationStatusHistory(db.Model):
    __tablename__ = 'application_status_history'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = db.Column(db.String(36), db.ForeignKey('applications.id'), nullable=False)
    old_status = db.Column(db.String(20))
    new_status = db.Column(db.String(20), nullable=False)
    changed_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text)
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    changed_by_user = db.relationship('User', backref='status_changes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'notes': self.notes,
            'changed_at': self.changed_at.isoformat()
        }

