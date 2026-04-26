from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from marshmallow import Schema, fields, validate, ValidationError
from models import db, User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

# Initialize JWT
jwt = JWTManager()

# Schemas
class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    full_name = fields.Str(allow_none=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UpdateProfileSchema(Schema):
    username = fields.Str(validate=validate.Length(min=3, max=80))
    full_name = fields.Str(allow_none=True)

class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=6))

register_schema = RegisterSchema()
login_schema = LoginSchema()
update_profile_schema = UpdateProfileSchema()
change_password_schema = ChangePasswordSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    # Check for existing user
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already taken'}), 409
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    # Update last login
    user.update_last_login()
    
    # Generate token
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'data': {'user': user.to_dict()}
    })

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        data = update_profile_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Check for duplicate username
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already taken'}), 409
        user.username = data['username']
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'data': {'user': user.to_dict()}
    })

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        data = change_password_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    if not user.check_password(data['current_password']):
        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Password changed successfully'
    })

# Initialize JWT with app
def init_jwt(app):
    jwt.init_app(app)

