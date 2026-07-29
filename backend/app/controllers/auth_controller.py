from flask import current_app, request
from flask_jwt_extended import create_access_token, get_jwt, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from controllers.common import current_business, current_user_id, error, ok
from store import store


def serialize_user(user):
    """Return user data that may safely be sent to a client."""
    return {
        field: value
        for field, value in user.items()
        if field != "password_hash"
    }


def create_business_data(user_id, data):
    goal = data.get("goal")
    goals = data.get("goals")

    if goals is None:
        goals = [goal] if goal else []

    return {
        "user_id": user_id,
        "name": str(data.get("business_name", "")).strip(),
        "business_type": str(data.get("business_type", "")).strip(),
        "business_size": str(data.get("business_size", "")).strip(),
        "description": "",
        "logo_url": "",
        "phone": "",
        "address": "",
        "website": "",
        "social_links": {},
        "working_hours": {},
        "goals": goals,
    }


def register():
    data = request.get_json(silent=True) or {}
    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not full_name or not email or not password:
        return error("full_name, email and password are required")
    if "@" not in email or len(password) < 6:
        return error("Use a valid email and a password of at least 6 characters")
    if store.first("users", email=email) is not None:
        return error("A user with this email already exists", 409)

    user = store.insert(
        "users",
        {
            "full_name": full_name,
            "email": email,
            "password_hash": generate_password_hash(password),
            "role": "business",
        },
    )
    business = store.insert("businesses", create_business_data(user["id"], data))
    token = create_access_token(identity=user["id"])

    response_data = {
        "access_token": token,
        "user": serialize_user(user),
        "business": business,
    }
    return ok(response_data, 201)


def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = store.first("users", email=email)

    if user is None:
        return error("Invalid email or password", 401)
    if not check_password_hash(user["password_hash"], password):
        return error("Invalid email or password", 401)

    response_data = {
        "access_token": create_access_token(identity=user["id"]),
        "user": serialize_user(user),
        "business": store.first("businesses", user_id=user["id"]),
    }
    return ok(response_data)


@jwt_required()
def logout():
    token_id = get_jwt()["jti"]
    current_app.config["JWT_BLOCKLIST"].add(token_id)
    return ok(message="Logged out")


@jwt_required()
def me():
    user = store.find("users", current_user_id())
    if user is None:
        return error("User not found", 404)

    return ok({"user": serialize_user(user), "business": current_business()})
