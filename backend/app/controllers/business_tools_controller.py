import random
from flask import request
from flask_jwt_extended import jwt_required
from controllers.common import current_business, current_user_id, business_required, ok, error
from store import store

class BusinessToolsController:
    
    @staticmethod
    @business_required
    def launch_tool():
        data = request.get_json(silent=True) or {}
        tool_type = data.get("tool_type", "promotion")
        config = data.get("config", {})

        business = current_business()

        active_tool = store.insert("active_tools", {
            "business_id": business["id"],
            "tool_type": tool_type,
            "status": "running",
            "config": config,
            "metrics": {
                "new_customers": 0,
                "returning_customers": 0,
                "revenue_generated": 0
            }
        })

        if tool_type == "promotion":
            store.insert("promotions", {
                "business_id": business["id"],
                "title": config.get("title", "Новая акция"),
                "description": config.get("description", ""),
                "discount_type": config.get("discount_type", "percent"),
                "discount_value": config.get("discount_value", 0),
                "status": "active"
            })

        return ok(active_tool, 201)

    @staticmethod
    @business_required
    def get_active_tools():
        business = current_business()
        active_tools = store.filter("active_tools", business_id=business["id"])
        favorite_ids = {
            favorite["tool_id"]
            for favorite in store.filter("favorites", user_id=current_user_id())
            if favorite.get("favorite_type") == "business_tool"
        }
        for tool in active_tools:
            tool["is_favorite"] = tool["id"] in favorite_ids
        return ok(active_tools)

    @staticmethod
    @business_required
    def add_favorite(tool_instance_id):
        business = current_business()
        tool = store.find("active_tools", tool_instance_id)
        if tool is None or tool.get("business_id") != business["id"]:
            return error("Инструмент не найден", 404)

        favorite = store.first(
            "favorites",
            user_id=current_user_id(),
            tool_id=tool_instance_id,
            favorite_type="business_tool",
        )
        if favorite is None:
            favorite = store.insert("favorites", {
                "user_id": current_user_id(),
                "tool_id": tool_instance_id,
                "favorite_type": "business_tool",
            })
        return ok(favorite, 201, message="Добавлено в избранное")

    @staticmethod
    @business_required
    def delete_favorite(tool_instance_id):
        business = current_business()
        tool = store.find("active_tools", tool_instance_id)
        if tool is None or tool.get("business_id") != business["id"]:
            return error("Инструмент не найден", 404)

        favorite = store.first(
            "favorites",
            user_id=current_user_id(),
            tool_id=tool_instance_id,
            favorite_type="business_tool",
        )
        if favorite is None:
            return error("В избранном не найдено", 404)
        store.delete("favorites", favorite["id"])
        return ok(message="Удалено из избранного")

    @staticmethod
    @jwt_required()
    def simulate_tool():
        data = request.get_json(silent=True) or {}
        config = data.get("config", {})

        base_customers = int(config.get("base_customers_per_month", 100))
        avg_check = int(config.get("avg_check", 2500))
        discount_percent = float(config.get("discount_value", 10))
        
        if discount_percent <= 0:
            growth_multiplier = 1.0
        elif discount_percent <= 10:
            growth_multiplier = 1.15
        elif discount_percent <= 20:
            growth_multiplier = 1.40
        else:
            growth_multiplier = 1.60

        projected_new_customers = int(base_customers * (growth_multiplier - 1))
        projected_returning = int(base_customers * 0.4 * growth_multiplier)
        
        expected_revenue = int((projected_new_customers + projected_returning) * avg_check * (1 - discount_percent / 100))

        return ok({
            "expected_new_customers_growth": f"+{projected_new_customers}",
            "expected_returning_visits": projected_returning,
            "projected_revenue": expected_revenue,
            "conversion_rate_estimate": f"{min(100, int(discount_percent * 1.5))}%"
        })

    @staticmethod
    @business_required
    def get_tool_metrics(tool_instance_id):
        business = current_business()
        tool = store.find("active_tools", tool_instance_id)

        if not tool:
            return error("Инструмент не найден", 404)
        
        if tool.get("business_id") != business["id"]:
            return error("Access denied", 403)

        metrics = tool.get("metrics", {})
        if metrics.get("new_customers") == 0:
             metrics = {
                 "new_customers": random.randint(5, 45),
                 "returning_customers": random.randint(10, 80),
                 "revenue_generated": random.randint(15000, 150000)
             }
             store.update("active_tools", tool_instance_id, {"metrics": metrics})

        return ok({
            "tool_id": tool_instance_id,
            "tool_type": tool.get("tool_type", "unknown"),
            "config": tool.get("config", {}),
            "metrics": metrics
        })
