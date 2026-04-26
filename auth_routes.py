from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, db
from marshmallow import Schema, fields, validate, ValidationError
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Validation Schemas
class UserRegistrationSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    full_name = fields.String(required=False, validate=validate.Length(max=120))

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No input data provided'}), 400
    
    # Validate input
    schema = UserRegistrationSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=validated_data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    if User.query.filter_by(username=validated_data['username']).first():
        return jsonify({'success': False, 'message': 'Username already taken'}), 409
    
    # Create new user
    new_user = User(
        username=validated_data['username'],
        email=validated_data['email'],
        full_name=validated_data.get('full_name')
    )
    new_user.set_password(validated_data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': {
            'user': new_user.to_dict(),
            'token': access_token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No input data provided'}), 400
    
    # Validate input
    schema = UserLoginSchema()
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({'success': False, 'message': 'Validation error', 'errors': err.messages}), 400
    
    # Find user by email
    user = User.query.filter_by(email=validated_data['email']).first()
    
    if not user or not user.check_password(validated_data['password']):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    # Update last login
    user.update_last_login()
    
    # Generate token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': user.to_dict(),
            'token': access_token
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict()
        }
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No input data provided'}), 400
    
    # Update allowed fields
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already taken'}), 409
        user.username = data['username']
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'user': user.to_dict()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to update profile'}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data or 'current_password' not in data or 'new_password' not in data:
        return jsonify({'success': False, 'message': 'Current password and new password are required'}), 400
    
    if not user.check_password(data['current_password']):
        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401
    
    if len(data['new_password']) < 6:
        return jsonify({'success': False, 'message': 'New password must be at least 6 characters long'}), 400
    
    user.set_password(data['new_password'])
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to change password'}), 500

