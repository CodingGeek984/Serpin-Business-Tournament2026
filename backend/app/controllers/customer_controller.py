from flask import current_app, request
from datetime import date

from controllers.common import access_denied, business_required, current_business, error, ok
from store import store


CUSTOMER_FIELDS = {
    "name", "phone", "email", "total_spent", "visits_count", "bonuses",
    "tags", "last_visit", "status",
}


def serialize_customer(customer):
    """One stable customer shape for the CRM screens and Firebase documents."""
    visits = int(customer.get("visits_count", customer.get("visits", 0)) or 0)
    spent = float(customer.get("total_spent", customer.get("ltv", 0)) or 0)
    status = customer.get("status")
    if status not in {"new", "regular", "sleeping", "churn"}:
        status = "regular" if visits >= 3 else "new"
    return {
        **customer,
        "visits_count": visits,
        "visits": visits,
        "total_spent": spent,
        "totalSpent": spent,
        "bonuses": int(customer.get("bonuses", customer.get("stamps", 0)) or 0),
        "stamps": int(customer.get("bonuses", customer.get("stamps", 0)) or 0),
        "status": status,
        "lastVisit": customer.get("last_visit", ""),
    }


def get_owned_customer(customer_id):
    customer = store.find("customers", customer_id)
    if customer is None:
        return None, error("Customer not found", 404)
    if customer["business_id"] != current_business()["id"]:
        return None, access_denied()
    return customer, None


def customer_fields(data):
    fields = {}
    for name, value in data.items():
        if name in CUSTOMER_FIELDS:
            fields[name] = value
    return fields


@business_required
def get_customers():
    business = current_business()
    customers = store.filter("customers", business_id=business["id"])
    query = request.args.get("q", "").lower()
    tag = request.args.get("tag")

    if query:
        customers = [
            customer for customer in customers
            if query in customer_search_text(customer)
        ]

    if tag:
        customers = [
            customer for customer in customers
            if tag in customer.get("tags", [])
        ]

    return ok([serialize_customer(customer) for customer in customers])


def customer_search_text(customer):
    fields = ("name", "phone", "email")
    text = " ".join(str(customer.get(field, "")) for field in fields)
    return text.lower()


@business_required
def create_customer():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    tags = data.get("tags", [])

    if not name:
        return error("name is required")
    if not isinstance(tags, list):
        return error("tags must be an array")
    for field in ("total_spent", "visits_count", "bonuses"):
        value = data.get(field, 0)
        if not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0:
            return error(f"{field} must be a non-negative number")
    if data.get("status", "new") not in {"new", "regular", "sleeping", "churn"}:
        return error("status is invalid")

    customer = customer_fields(data)
    customer["business_id"] = current_business()["id"]
    customer["name"] = name
    customer["phone"] = data.get("phone", "")
    customer["email"] = data.get("email", "")
    customer["total_spent"] = data.get("total_spent", 0)
    customer["visits_count"] = data.get("visits_count", 0)
    customer["bonuses"] = data.get("bonuses", 0)
    customer["tags"] = tags
    customer["last_visit"] = data.get("last_visit") or date.today().isoformat()

    created_customer = store.insert("customers", customer)
    
    # Saving a CRM record must not fail because an optional achievement/task
    # update is temporarily unavailable in Firestore.
    rewards = None
    try:
        from services.gamification_service import GamificationService
        from controllers.common import current_user_id
        rewards = GamificationService.trigger_event(current_user_id(), 'ADD_CUSTOMER')
    except Exception:
        current_app.logger.exception("Customer saved but gamification update failed")
    
    response = serialize_customer(created_customer)
    if rewards:
        response["gamification_rewards"] = rewards.get("gamification_rewards", [])
    return ok(response, 201)


@business_required
def get_customer(customer_id):
    customer, failure = get_owned_customer(customer_id)
    if failure:
        return failure

    return ok(serialize_customer(customer))


@business_required
def update_customer(customer_id):
    customer, failure = get_owned_customer(customer_id)
    if failure:
        return failure

    data = request.get_json(silent=True) or {}
    updates = customer_fields(data)
    if "tags" in updates and not isinstance(updates["tags"], list):
        return error("tags must be an array")
    for field in ("total_spent", "visits_count", "bonuses"):
        if field in updates and (not isinstance(updates[field], (int, float)) or isinstance(updates[field], bool) or updates[field] < 0):
            return error(f"{field} must be a non-negative number")
    if "status" in updates and updates["status"] not in {"new", "regular", "sleeping", "churn"}:
        return error("status is invalid")

    updated_customer = store.update("customers", customer_id, updates)
    return ok(serialize_customer(updated_customer))


@business_required
def delete_customer(customer_id):
    customer, failure = get_owned_customer(customer_id)
    if failure:
        return failure

    store.delete("customers", customer_id)
    return ok(message="Customer deleted")
