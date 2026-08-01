"""Onboarding and personalised recommendation endpoints."""
from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_business, error, ok
from store import store


class OnboardingController:
    """Persist onboarding answers and build recommendations for its owner."""

    BUSINESS_TYPES = {"coffee_shop", "beauty_salon", "retail", "auto_service", "other"}
    BUSINESS_SIZES = {"single_location", "two_to_five_locations", "chain"}
    GOALS = {"new_customers", "loyalty", "increase_average_check", "automation"}

    TYPE_SLUGS = {
        "coffee_shop": ("6th-coffee-free", "happy-hours"),
        "beauty_salon": ("return-21-days", "bring-a-friend"),
        "retail": ("welcome-bonus", "clearance-sale"),
        "auto_service": ("return-21-days", "whatsapp-return"),
    }
    GOAL_SLUGS = {
        "new_customers": ("welcome-bonus", "bring-a-friend"),
        "loyalty": ("6th-coffee-free", "return-21-days", "whatsapp-return"),
        "increase_average_check": ("happy-hours", "basic-analytics"),
        "automation": ("whatsapp-return", "basic-analytics"),
    }

    @staticmethod
    def _normalise_goals(value):
        if not isinstance(value, list) or not value:
            return None
        if any(goal not in OnboardingController.GOALS for goal in value):
            return None
        # Keeps the input deterministic and prevents duplicate values in storage.
        return list(dict.fromkeys(value))

    @staticmethod
    def _serialize_item(item, kind, score, reasons):
        return {
            "id": item["id"],
            "kind": kind,
            "name": item.get("name", item.get("title", "")),
            "description": item.get("description", item.get("desc", "")),
            "slug": item.get("slug"),
            "type": item.get("type"),
            "category": item.get("category", "Акции" if kind == "template" else "Инструмент"),
            "icon": item.get("icon", "Gift" if kind == "template" else "Settings"),
            "score": score,
            "badge": reasons[0] if reasons else "Подходит вашему бизнесу",
            "reasons": reasons,
        }

    @staticmethod
    @jwt_required()
    def complete():
        business = current_business()
        if business is None:
            return error("Business profile not found", 404)

        data = request.get_json(silent=True) or {}
        business_type = data.get("business_type")
        business_size = data.get("business_size")
        primary_goals = OnboardingController._normalise_goals(data.get("primary_goals"))

        if business_type not in OnboardingController.BUSINESS_TYPES:
            return error("Unsupported business_type")
        if business_size not in OnboardingController.BUSINESS_SIZES:
            return error("Unsupported business_size")
        if primary_goals is None:
            return error("primary_goals must contain at least one supported goal")

        updated = store.update("businesses", business["id"], {
            "business_type": business_type,
            "business_size": business_size,
            "primary_goals": primary_goals,
            # Legacy field stays in sync with the existing profile/settings UI.
            "goals": primary_goals,
            "is_onboarding_completed": True,
        })
        return ok(updated, message="Онбординг завершён. Персональный план роста готов.")

    @staticmethod
    @jwt_required()
    def get_recommendations():
        business = current_business()
        if business is None:
            return error("Business profile not found", 404)

        business_type = business.get("business_type", "other")
        goals = business.get("primary_goals") or business.get("goals") or []
        candidates = {}

        def add(slug, reason, weight):
            entry = candidates.setdefault(slug, {"score": 0, "reasons": []})
            entry["score"] += weight
            if reason not in entry["reasons"]:
                entry["reasons"].append(reason)

        type_labels = {
            "coffee_shop": "Подходит для кофеен", "beauty_salon": "Подходит для салонов красоты",
            "retail": "Подходит для магазинов", "auto_service": "Подходит для автосервисов",
        }
        for slug in OnboardingController.TYPE_SLUGS.get(business_type, ()):
            add(slug, type_labels.get(business_type, "Подходит вашему бизнесу"), 10)
        for goal in goals:
            for slug in OnboardingController.GOAL_SLUGS.get(goal, ()):
                add(slug, "Подходит под вашу цель", 5)

        # Useful fallback for businesses that selected "other".
        if not candidates:
            for slug in ("welcome-bonus", "basic-analytics", "whatsapp-return"):
                add(slug, "Подходит вашему бизнесу", 1)

        tools_by_slug = {tool.get("slug"): tool for tool in store.all("tools") if tool.get("is_active")}
        templates_by_slug = {template.get("slug"): template for template in store.all("promotion_templates") if template.get("is_active")}
        result = []
        for slug, meta in candidates.items():
            item = tools_by_slug.get(slug)
            if item:
                result.append(OnboardingController._serialize_item(item, "tool", meta["score"], meta["reasons"]))
            elif templates_by_slug.get(slug):
                result.append(OnboardingController._serialize_item(templates_by_slug[slug], "template", meta["score"], meta["reasons"]))

        # Some preset tools may not yet exist in an older database; return a useful
        # promotion preset instead of silently dropping the recommendation.
        preset_names = {
            "bring-a-friend": "Приведи подругу", "clearance-sale": "Распродажа остатков",
        }
        for slug, meta in candidates.items():
            if slug not in tools_by_slug and slug not in templates_by_slug and slug in preset_names:
                result.append({
                    "id": "preset-" + slug, "kind": "template", "name": preset_names[slug],
                    "description": "Готовый шаблон акции для быстрого запуска.", "slug": slug,
                    "type": "promotion", "category": "Готовая акция", "icon": "Gift",
                    "score": meta["score"], "badge": meta["reasons"][0], "reasons": meta["reasons"],
                })

        result.sort(key=lambda item: (-item["score"], item["name"]))
        return ok(result[:6], message="Персональные рекомендации сформированы")
