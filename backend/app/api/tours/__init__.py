from flask import Blueprint

tours_bp = Blueprint('tours', __name__)

from . import routes
