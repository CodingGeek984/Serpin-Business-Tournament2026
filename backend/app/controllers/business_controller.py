from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_business, current_user_id, error, ok
from store import store


class BusinessController:
    EDITABLE_FIELDS = {
        "name", "business_type", "business_size", "description", "logo_url",
        "phone", "address", "website", "social_links", "working_hours", "goals", "primary_goals",
    }

    @staticmethod
    @jwt_required()
    def get_dashboard():
        business = current_business()
        if not business:
            return error("Business profile not found", 404)
        
        # Aggregate dashboard data
        promotions = store.filter("promotions", business_id=business["id"])
        active_promotions = [p for p in promotions if p.get("is_active", p.get("status") == "active")]
        
        customers = store.filter("customers", business_id=business["id"])
        
        # CRM stores canonical total_spent / visits_count fields.
        monthly_revenue = sum(float(c.get("total_spent", c.get("ltv", 0)) or 0) for c in customers)
        monthly_visits = sum(int(c.get("visits_count", c.get("visits", 0)) or 0) for c in customers)

        # Sort recent customers safely
        recent_customers = sorted(customers, key=lambda c: c.get("last_visit", "1970-01-01"), reverse=True)[:5]

        from controllers.promotion_controller import serialize_promotion
        serialized_promotions = [serialize_promotion(p) for p in active_promotions[:5]]

        data = {
            "active_promotions_count": len(active_promotions),
            "total_customers": len(customers),
            "monthly_revenue": monthly_revenue,
            "monthly_visits": monthly_visits,
            "recent_customers": recent_customers,
            "active_promotions": serialized_promotions
        }
        return ok(data)

    @staticmethod
    @jwt_required()
    def get_profile():
        business = current_business()
        if not business:
            return error("Business profile not found", 404)
        return ok(business)

    @staticmethod
    @jwt_required()
    def update_profile():
        business = current_business()
        if not business:
            return error("Business profile not found", 404)

        data = request.get_json(silent=True) or {}
        updates = {}

        string_fields = {
            "name", "business_type", "business_size", "description", "logo_url",
            "phone", "address", "website"
        }

        for field, value in data.items():
            if field in BusinessController.EDITABLE_FIELDS:
                if field in string_fields and not isinstance(value, str):
                    return error(f"{field} must be a string")
                updates[field] = value

        for field in ("social_links", "working_hours"):
            if field in updates and not isinstance(updates[field], dict):
                return error(f"{field} must be an object")

        if "goals" in updates and not isinstance(updates["goals"], list):
            return error("goals must be an array")

        updated_business = store.update("businesses", business["id"], updates)
        return ok(updated_business, message="Данные компании успешно обновлены")

    @staticmethod
    @jwt_required()
    def get_stats():
        business = current_business()
        if not business:
            return error("Business profile not found", 404)
        
        data = {
            "revenue": {
                "today": 15000,
                "week": 105000,
                "month": 450000
            },
            "visits": {
                "today": 25,
                "week": 180,
                "month": 750
            },
            "conversion_rate": 4.2
        }
        return ok(data)
