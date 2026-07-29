from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_business, error, ok
from store import store


EDITABLE_FIELDS = {
    "name", "business_type", "business_size", "description", "logo_url",
    "phone", "address", "website", "social_links", "working_hours", "goals",
}


@jwt_required()
def get_business():
    business = current_business()

    if business is None:
        return error("Business profile not found", 404)

    return ok(business)


@jwt_required()
def update_business():
    business = current_business()
    if business is None:
        return error("Business profile not found", 404)

    data = request.get_json(silent=True) or {}
    updates = {}

    for field, value in data.items():
        if field in EDITABLE_FIELDS:
            updates[field] = value

    for field in ("social_links", "working_hours"):
        if field in updates and not isinstance(updates[field], dict):
            return error(f"{field} must be an object")

    if "goals" in updates and not isinstance(updates["goals"], list):
        return error("goals must be an array")

    updated_business = store.update("businesses", business["id"], updates)
    return ok(updated_business)
