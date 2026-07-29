from flask import request

from controllers.common import business_required, current_business, error, ok
from store import store


CUSTOMER_FIELDS = {
    "name", "phone", "email", "total_spent", "visits_count", "bonuses",
    "tags", "last_visit",
}


def get_owned_customer(customer_id):
    customer = store.find("customers", customer_id)
    business = current_business()

    if customer is None or customer["business_id"] != business["id"]:
        return None

    return customer


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

    return ok(customers)


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

    customer = customer_fields(data)
    customer["business_id"] = current_business()["id"]
    customer["name"] = name
    customer["phone"] = data.get("phone", "")
    customer["email"] = data.get("email", "")
    customer["total_spent"] = data.get("total_spent", 0)
    customer["visits_count"] = data.get("visits_count", 0)
    customer["bonuses"] = data.get("bonuses", 0)
    customer["tags"] = tags

    created_customer = store.insert("customers", customer)
    return ok(created_customer, 201)


@business_required
def get_customer(customer_id):
    customer = get_owned_customer(customer_id)
    if customer is None:
        return error("Customer not found", 404)

    return ok(customer)


@business_required
def update_customer(customer_id):
    customer = get_owned_customer(customer_id)
    if customer is None:
        return error("Customer not found", 404)

    data = request.get_json(silent=True) or {}
    updates = customer_fields(data)
    if "tags" in updates and not isinstance(updates["tags"], list):
        return error("tags must be an array")

    updated_customer = store.update("customers", customer_id, updates)
    return ok(updated_customer)


@business_required
def delete_customer(customer_id):
    customer = get_owned_customer(customer_id)
    if customer is None:
        return error("Customer not found", 404)

    store.delete("customers", customer_id)
    return ok(message="Customer deleted")
