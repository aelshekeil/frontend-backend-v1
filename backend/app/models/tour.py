from app.extensions import db
from datetime import datetime

class Tour(db.Model):
    __tablename__ = 'tours'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.String(1000), nullable=False)
    destination = db.Column(db.String(50), nullable=False, index=True)
    price = db.Column(db.Decimal(10, 2), nullable=False, index=True)
    duration = db.Column(db.Integer, nullable=False)
    max_participants = db.Column(db.Integer, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Composite index for common queries
    __table_args__ = (
        db.Index('idx_destination_price', 'destination', 'price'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'destination': self.destination,
            'price': str(self.price),
            'duration': self.duration,
            'max_participants': self.max_participants,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }
