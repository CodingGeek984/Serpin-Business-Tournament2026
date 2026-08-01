from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from flask_jwt_extended import jwt_required

from controllers.common import current_user_id, ok, error
from store import store
from services.gamification_service import GamificationService

class GamificationController:
    @staticmethod
    @jwt_required()
    def get_status():
        user_id = current_user_id()
        GamificationService._seed_data()
        profile = GamificationService.get_or_create_profile(user_id)
        
        today = datetime.now(timezone.utc).date().isoformat()
        
        # Get tasks
        tasks = store.all("daily_tasks")
        tasks_data = []
        for task in tasks:
            prog = store.first("user_task_progress", user_id=user_id, task_id=task["id"], date=today)
            tasks_data.append({
                "id": task["id"],
                "title": task["title"],
                "target": task["target_count"],
                "current": prog["current_count"] if prog else 0,
                "is_completed": prog["is_completed"] if prog else False,
                "is_claimed": prog["is_claimed"] if prog else False,
                "reward_points": task["reward_points"],
                "reward_xp": task["reward_xp"]
            })

        # Get achievements
        all_ach = store.all("achievements")
        user_ach_list = store.filter("user_achievements", user_id=user_id)
        user_ach_ids = {a["achievement_id"] for a in user_ach_list}
        
        achievements_data = []
        for ach in all_ach:
            achievements_data.append({
                "id": ach["id"],
                "title": ach["title"],
                "description": ach["description"],
                "icon_key": ach.get("icon_key", "Gift"),
                "unlocked": ach["id"] in user_ach_ids
            })

        return ok({
            "profile": {
                "points": profile["points"],
                "xp": profile["xp"],
                "level": profile["level"],
                "streak": profile["current_streak"],
                "next_level_xp": GamificationService.LEVEL_XP_THRESHOLDS.get(profile["level"] + 1, "MAX")
            },
            "daily_tasks": tasks_data,
            "achievements": achievements_data
        })

    @staticmethod
    @jwt_required()
    def claim_daily_reward():
        user_id = current_user_id()
        profile = GamificationService.get_or_create_profile(user_id)
        today = datetime.now(timezone.utc).date()
        today_str = today.isoformat()

        if profile.get("last_login_date") == today_str:
            return error("Already claimed today", 400)

        yesterday_str = (today - timedelta(days=1)).isoformat()
        if profile.get("last_login_date") == yesterday_str:
            profile["current_streak"] += 1
        else:
            profile["current_streak"] = 1
            
        profile["last_login_date"] = today_str
        profile["points"] += 10
        
        store.update("gamification_profiles", profile["id"], {
            "current_streak": profile["current_streak"],
            "last_login_date": profile["last_login_date"],
            "points": profile["points"]
        })
        
        GamificationService._add_xp(profile, 20)
        
        return ok({"message": "Daily reward claimed!"})

    @staticmethod
    @jwt_required()
    def claim_task_reward():
        user_id = current_user_id()
        task_id = request.json.get("task_id") if request.is_json else None
        if not task_id:
            return error("task_id is required", 400)

        today = datetime.now(timezone.utc).date().isoformat()

        prog = store.first("user_task_progress", user_id=user_id, task_id=task_id, date=today)
        if not prog or not prog.get("is_completed") or prog.get("is_claimed"):
            return error("Task not ready to claim", 400)

        task = store.find("daily_tasks", task_id)
        if not task:
            return error("Task not found", 404)
            
        profile = GamificationService.get_or_create_profile(user_id)
        
        store.update("user_task_progress", prog["id"], {"is_claimed": True})
        
        profile["points"] += task["reward_points"]
        store.update("gamification_profiles", profile["id"], {"points": profile["points"]})
        GamificationService._add_xp(profile, task["reward_xp"])
        
        return ok({"message": "Reward claimed"})
