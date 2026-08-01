from flask import request

from controllers.common import access_denied, business_required, current_business, error, ok
from store import store


PROMOTION_FIELDS = {
    "title", "description", "promo_code", "discount_type", "discount_value",
    "start_date", "end_date", "is_active", "usage_count",
}


def serialize_promotion(promotion):
    """Expose one stable contract to the React promotion pages."""
    is_active = promotion.get("is_active", promotion.get("status") == "active")
    return {
        **promotion,
        "status": "active" if is_active else "paused",
        "is_active": is_active,
        "views": int(promotion.get("views", 0) or 0),
        "conversions": int(promotion.get("conversions", promotion.get("usage_count", 0)) or 0),
        "budget": float(promotion.get("budget", promotion.get("discount_value", 0)) or 0),
        "spent": float(promotion.get("spent", 0) or 0),
        "endDate": promotion.get("endDate", promotion.get("end_date", "")),
        "startDate": promotion.get("startDate", promotion.get("start_date", "")),
        "type": promotion.get("type", promotion.get("discount_type", "discount")),
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
    return ok([serialize_promotion(promotion) for promotion in promotions])


@business_required
def create_promotion():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    discount_type = data.get("discount_type", "percentage")

    if not title:
        return error("title is required")
    if discount_type not in {"percentage", "fixed"}:
        return error("discount_type must be percentage or fixed")

    status = data.get("status", "active")
    if status not in {"active", "paused"}:
        return error("status must be active or paused")

    promotion = {
        **allowed_fields(data),
        "business_id": current_business()["id"],
        "title": title,
        "description": str(data.get("description", "")),
        "promo_code": str(data.get("promo_code", "")),
        "type": str(data.get("type", "discount")),
        "discount_type": discount_type,
        "discount_value": data.get("discount_value", 0),
        "budget": data.get("budget", 0),
        "spent": data.get("spent", 0),
        "start_date": data.get("startDate", data.get("start_date", "")),
        "end_date": data.get("endDate", data.get("end_date", "")),
        "is_active": status == "active" if "is_active" not in data else bool(data["is_active"]),
        "usage_count": 0,
        "views": 0,
        "conversions": 0,
        "qr_data": data.get("qrData", ""),
    }

    created_promotion = store.insert("promotions", promotion)
    
    from services.gamification_service import GamificationService
    from controllers.common import current_user_id
    rewards = GamificationService.trigger_event(current_user_id(), 'CREATE_PROMOTION')
    
    response = serialize_promotion(created_promotion)
    if rewards:
        response["gamification_rewards"] = rewards.get("gamification_rewards", [])
        
    return ok(response, 201, message="Акция создана")


@business_required
def get_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    return ok(serialize_promotion(promotion))


@business_required
def update_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    data = request.get_json(silent=True) or {}
    updates = allowed_fields(data)
    if "status" in data:
        if data["status"] not in {"active", "paused"}:
            return error("status must be active or paused")
        updates["is_active"] = data["status"] == "active"
    if "endDate" in data:
        updates["end_date"] = data["endDate"]
    if "budget" in data:
        updates["budget"] = data["budget"]
    updated_promotion = store.update("promotions", promotion_id, updates)
    return ok(serialize_promotion(updated_promotion), message="Акция обновлена")


@business_required
def delete_promotion(promotion_id):
    promotion, failure = get_owned_promotion(promotion_id)
    if failure:
        return failure

    store.delete("promotions", promotion_id)
    return ok(message="Promotion deleted")


    