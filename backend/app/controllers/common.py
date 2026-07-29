"""Shared helpers for API controllers."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from store import store


def ok(data=None, status=200, **extra):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status


def error(message, status=400):
    return jsonify({"success": False, "message": message}), status


def access_denied():
    """Return a consistent response when an existing resource belongs to another user."""
    return error("Access denied", 403)


def current_user_id():
    return str(get_jwt_identity())


def current_business():
    return store.first("businesses", user_id=current_user_id())


def current_user():
    return store.find("users", current_user_id())


def business_required(handler):
    @wraps(handler)
    @jwt_required()
    def wrapped(*args, **kwargs):
        if not current_business():
            return error("Business profile not found", 404)
        return handler(*args, **kwargs)
    return wrapped


def admin_required(handler):
    @wraps(handler)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None or user.get("role") != "admin":
            return access_denied()
        return handler(*args, **kwargs)
    return wrapped
