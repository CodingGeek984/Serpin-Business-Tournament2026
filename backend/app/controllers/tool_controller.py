from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_user_id, current_business, admin_required, error, ok
from store import store

class ToolController:
    @staticmethod
    def _add_user_flags(tool):
        favorite = store.first(
            "favorites",
            user_id=current_user_id(),
            tool_id=tool["id"],
        )
        tool["is_favorite"] = favorite is not None
        
        business = current_business()
        tool["is_activated"] = False
        if business:
            active_tool = store.first("active_tools", business_id=business["id"], tool_id=tool["id"])
            tool["is_activated"] = active_tool is not None
            
        return tool

    @staticmethod
    @jwt_required()
    def get_tools():
        category = request.args.get("category")
        query = request.args.get("q", "").lower()
        result = []

        for tool in store.all("tools"):
            if not tool.get("is_active"):
                continue
            if category and tool.get("category") != category:
                continue
            if query and query not in tool.get("name", "").lower() and query not in tool.get("description", "").lower():
                continue
            result.append(ToolController._add_user_flags(tool))

        return ok(result)

    @staticmethod
    @jwt_required()
    def get_tool(slug):
        tool = store.first("tools", slug=slug)
        if tool is None or not tool.get("is_active"):
            return error("Инструмент не найден", 404)
        return ok(ToolController._add_user_flags(tool))

    @staticmethod
    @jwt_required()
    def add_favorite(tool_id):
        tool = store.find("tools", tool_id)
        if tool is None:
            return error("Инструмент не найден", 404)

        favorite = store.first("favorites", user_id=current_user_id(), tool_id=tool_id)
        if favorite is None:
            favorite = store.insert("favorites", {"user_id": current_user_id(), "tool_id": tool_id})

        return ok(favorite, 201, message="Добавлено в избранное")

    @staticmethod
    @jwt_required()
    def delete_favorite(tool_id):
        favorite = store.first("favorites", user_id=current_user_id(), tool_id=tool_id)
        if favorite is None:
            return error("В избранном не найдено", 404)

        store.delete("favorites", favorite["id"])
        return ok(message="Удалено из избранного")

    @staticmethod
    @jwt_required()
    def get_favorites():
        favorites = store.filter("favorites", user_id=current_user_id())
        favorite_tool_ids = {f["tool_id"] for f in favorites}
        result = []

        for tool in store.all("tools"):
            if tool["id"] in favorite_tool_ids and tool.get("is_active"):
                result.append(ToolController._add_user_flags(tool))

        return ok(result)

    @staticmethod
    @jwt_required()
    def activate_tool(tool_id):
        business = current_business()
        if not business:
            return error("Профиль бизнеса не найден", 404)
            
        tool = store.find("tools", tool_id)
        if tool is None:
            return error("Инструмент не найден", 404)
            
        active_tool = store.first("active_tools", business_id=business["id"], tool_id=tool_id)
        if active_tool:
            return error("Инструмент уже активирован", 400)
            
        store.insert("active_tools", {
            "business_id": business["id"],
            "tool_id": tool_id,
            "status": "active"
        })
        
        from services.gamification_service import GamificationService
        from controllers.common import current_user_id
        rewards = GamificationService.trigger_event(current_user_id(), 'ACTIVATE_TOOL')
        
        response = {"message": f"Инструмент {tool['name']} успешно активирован!"}
        if rewards:
            response.update(rewards)
            
        return ok(response)

    @staticmethod
    @jwt_required()
    def get_recommendations():
        business = current_business()
        if not business:
            return error("Профиль бизнеса не найден", 404)
            
        b_type = (business.get("business_type") or "").lower()
        all_tools = store.all("tools")
        active = [t for t in all_tools if t.get("is_active")]
        
        recommended = []
        if "кофейня" in b_type or "кафе" in b_type:
            recommended = [t for t in active if t.get("slug") in ["6th-coffee-free", "happy-hours"]]
        elif "салон" in b_type or "красот" in b_type or "барбер" in b_type:
            recommended = [t for t in active if t.get("slug") in ["welcome-bonus", "whatsapp-return"]]
        elif "магазин" in b_type or "одежд" in b_type:
            recommended = [t for t in active if t.get("slug") in ["return-21-days", "basic-analytics"]]
        else:
            recommended = active[:3]
            
        if len(recommended) < 2:
            recommended = active[:3]
            
        result = [ToolController._add_user_flags(t) for t in recommended[:3]]
        return ok(result)

    @staticmethod
    @admin_required
    def create_admin_tool():
        data = request.get_json(silent=True) or {}
        if not data.get("name") or not data.get("slug"):
            return error("name и slug обязательны", 400)
            
        new_tool = store.insert("tools", {
            "name": data["name"],
            "slug": data["slug"],
            "category": data.get("category", "marketing"),
            "description": data.get("description", ""),
            "icon": data.get("icon", "Settings"),
            "is_active": data.get("is_active", True)
        })
        return ok(new_tool, 201, message="Инструмент создан")

    @staticmethod
    @admin_required
    def update_admin_tool(tool_id):
        data = request.get_json(silent=True) or {}
        tool = store.find("tools", tool_id)
        if not tool:
            return error("Инструмент не найден", 404)
            
        updated = store.update("tools", tool_id, data)
        return ok(updated, message="Инструмент обновлен")

    @staticmethod
    @admin_required
    def delete_admin_tool(tool_id):
        tool = store.find("tools", tool_id)
        if not tool:
            return error("Инструмент не найден", 404)
            
        store.delete("tools", tool_id)
        return ok(message="Инструмент удален")
