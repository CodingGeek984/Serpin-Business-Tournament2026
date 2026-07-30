from flask_jwt_extended import jwt_required

from controllers.common import access_denied, business_required, current_business, error, ok
from store import store


class RecommendationController:
    """Recommendations engine for the currently authenticated business."""

    RULES = {
        "coffee_shop": {"acquisition": "happy-hours", "retention": "6th-coffee-free", "average_check": "coffee-dessert-set"},
        "beauty_salon": {"acquisition": "bring-a-friend", "retention": "return-21-days", "average_check": "manicure-pedicure-set"},
        "retail": {"acquisition": "welcome-bonus", "retention": "private-sale", "average_check": "third-item-half-price"},
        "auto_service": {"acquisition": "welcome-bonus", "retention": "return-21-days", "average_check": "basic-analytics"},
    }
    GOAL_ALIASES = {
        "new_customers": "acquisition", "acquisition": "acquisition",
        "loyalty": "retention", "retention": "retention", "returning_customers": "retention",
        "increase_average_check": "average_check", "average_check": "average_check",
    }
    TYPE_NAMES = {
        "coffee_shop": "кофейни", "beauty_salon": "салона красоты",
        "retail": "магазина одежды", "auto_service": "автосервиса",
    }
    GOAL_REASONS = {
        "acquisition": "привлечь новых клиентов", "retention": "повысить повторные продажи",
        "average_check": "увеличить средний чек",
    }

    @staticmethod
    def _item(item, kind, match_reason, is_personalized):
        return {
            "id": item["id"], "kind": kind, "name": item.get("name", ""),
            "description": item.get("description", ""), "slug": item.get("slug"),
            "icon": item.get("icon", "Gift" if kind == "template" else "Settings"),
            "is_personalized": is_personalized, "match_reason": match_reason,
        }

    @staticmethod
    @jwt_required()
    def get_recommendations():
        business = current_business()
        if business is None:
            return error("Business profile not found", 404)

        business_type = business.get("business_type")
        raw_goals = business.get("primary_goals") or ([business.get("primary_goal")] if business.get("primary_goal") else [])
        goals = [RecommendationController.GOAL_ALIASES[goal] for goal in raw_goals if goal in RecommendationController.GOAL_ALIASES]
        tools = [tool for tool in store.all("tools") if tool.get("is_active")]
        templates = [template for template in store.all("promotion_templates") if template.get("is_active")]
        by_slug = {item.get("slug"): (item, "tool") for item in tools}
        by_slug.update({item.get("slug"): (item, "template") for item in templates})

        if business_type in RecommendationController.RULES and goals:
            items = []
            for goal in dict.fromkeys(goals):
                slug = RecommendationController.RULES[business_type].get(goal)
                if slug and slug in by_slug:
                    item, kind = by_slug[slug]
                    reason = (
                        f"Идеально подходит для {RecommendationController.TYPE_NAMES[business_type]} "
                        f"с целью {RecommendationController.GOAL_REASONS[goal]}"
                    )
                    items.append(RecommendationController._item(item, kind, reason, True))
            if items:
                return ok({
                    "title": f"Персональные рекомендации для вашей {RecommendationController.TYPE_NAMES[business_type]}",
                    "is_personalized": True, "items": items,
                }, message="Персональные рекомендации сформированы")

        default_tools = sorted(tools, key=lambda tool: (not tool.get("is_featured", False), tool.get("name", "")))[:3]
        return ok({
            "title": "Популярные инструменты платформы", "is_personalized": False,
            "items": [RecommendationController._item(tool, "tool", "Популярный инструмент платформы", False) for tool in default_tools],
        }, message="Показаны популярные инструменты")


def get_recommendations():
    return RecommendationController.get_recommendations()


@business_required
def dismiss_recommendation(recommendation_id):
    recommendation = store.find("recommendations", recommendation_id)
    business = current_business()

    if recommendation is None:
        return error("Recommendation not found", 404)
    if recommendation["business_id"] != business["id"]:
        return access_denied()

    updated_recommendation = store.update(
        "recommendations",
        recommendation_id,
        {"is_dismissed": True},
    )
    return ok(updated_recommendation)
