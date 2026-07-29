from flask import request

from controllers.common import admin_required, business_required, error, ok
from store import store


def serialize_template(template):
    return {
        "id": template["id"],
        "title": template["name"],
        "type": template["type"],
        "defaultBudget": template.get("default_budget", 0),
        "desc": template.get("description", ""),
    }


@business_required
def get_templates():
    templates = store.filter("promotion_templates", is_active=True)
    return ok([serialize_template(template) for template in templates])


@admin_required
def get_admin_templates():
    return ok([serialize_template(template) for template in store.all("promotion_templates")])


@admin_required
def create_template():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    template_type = str(data.get("type", "discount")).strip()
    if not title:
        return error("title is required")
    if template_type not in {"discount", "stamp", "time_discount", "winback"}:
        return error("Unsupported template type")
    template = store.insert("promotion_templates", {
        "name": title,
        "type": template_type,
        "default_budget": data.get("defaultBudget", 0),
        "description": str(data.get("desc", "")).strip(),
        "is_active": True,
    })
    return ok(serialize_template(template), 201)


@admin_required
def delete_template(template_id):
    template = store.find("promotion_templates", template_id)
    if template is None:
        return error("Promotion template not found", 404)
    store.update("promotion_templates", template_id, {"is_active": False})
    return ok(message="Promotion template deactivated")
