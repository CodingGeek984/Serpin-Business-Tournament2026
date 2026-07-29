from flask import request

from controllers.common import access_denied, business_required, current_business, error, ok
from store import store


PROMOTION_FIELDS = {
    "title", "description", "promo_code", "discount_type", "discount_value",
    "start_date", "end_date", "is_active", "usage_count",
}


def get_owned_promotion(promotion_id):
    promotion = store.find("promotions", promotion_id)
    if promotion is None:
        return None, error("Promotion not found", 404)
    if promotion["business_id"] != current_business()["id"]:
        return None, access_denied()
    return promotion, None


def allowed_fields(data):
    updates = {}
    for field, value in data.items():
        if field in PROMOTION_FIELDS:
            updates[field] = value
    return updates


@business_required
def get_promotions():
    business = current_business()
    promotions = store.filter("promotions", business_id=business["id"])
    return ok(promotions)


@business_required
def create_promotion():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    discount_type = data.get("discount_type", "percentage")

    if not title:
        return error("title is required")
    if discount_type not in {"percentage", "fixed"}:
        return error("discount_type must be percentage or fixed")

    promotion = allowed_fields(data)
    promotion["business_id"] = current_business()["id"]
    promotion["title"] = title
    promotion["description"] = data.get("description", "")
    promotion["promo_code"] = data.get("promo_code", "")
    promotion["discount_type"] = discount_type
    promotion["discount_value"] = data.get("discount_value", 0)
    promotion["is_active"] = data.get("is_active", True)
    promotion["usage_count"] = 0

    created_promotion = store.insert("promotions", promotion)
    return ok(created_promotion, 201)


@business_required
def get_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    return ok(promotion)


@business_required
def update_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    data = request.get_json(silent=True) or {}
    updates = allowed_fields(data)
    updated_promotion = store.update("promotions", promotion_id, updates)
    return ok(updated_promotion)


@business_required
def delete_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    store.update("promotions", promotion_id, {"is_active": False})
    return ok(message="Promotion deactivated")
