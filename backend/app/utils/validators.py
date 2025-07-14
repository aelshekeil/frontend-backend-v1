from marshmallow import Schema, fields, validate, ValidationError
import re

class TourSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    destination = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    price = fields.Decimal(required=True, validate=validate.Range(min=0))
    duration = fields.Int(required=True, validate=validate.Range(min=1, max=365))
    max_participants = fields.Int(required=True, validate=validate.Range(min=1, max=100))

def validate_tour_data(data):
    """Validate tour creation/update data"""
    schema = TourSchema()
    try:
        schema.load(data)
        return None
    except ValidationError as err:
        return err.messages

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    """Basic input sanitization"""
    if not isinstance(text, str):
        return text
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
    for char in dangerous_chars:
        text = text.replace(char, '')
    
    return text.strip()
