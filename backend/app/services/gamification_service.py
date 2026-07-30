import os
from datetime import datetime, timezone
from store import store

class GamificationService:
    LEVEL_XP_THRESHOLDS = {1: 0, 2: 100, 3: 300, 4: 600, 5: 1000}

    @staticmethod
    def now():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def get_or_create_profile(user_id):
        profile = store.first("gamification_profiles", user_id=user_id)
        if not profile:
            profile = store.insert("gamification_profiles", {
                "user_id": user_id,
                "points": 0,
                "xp": 0,
                "level": 1,
                "current_streak": 0,
                "last_login_date": None
            })
        return profile

    @staticmethod
    def _add_xp(profile, xp_amount):
        profile["xp"] += xp_amount
        current_level = profile["level"]
        next_level = current_level + 1
        level_up = False

        if next_level in GamificationService.LEVEL_XP_THRESHOLDS:
            if profile["xp"] >= GamificationService.LEVEL_XP_THRESHOLDS[next_level]:
                profile["level"] = next_level
                level_up = True
        
        store.update("gamification_profiles", profile["id"], {
            "xp": profile["xp"],
            "level": profile["level"]
        })
        return level_up

    @staticmethod
    def _seed_data():
        if not store.all("achievements"):
            store.insert("achievements", {"code": "first_promo", "title": "Первая акция", "description": "Создайте свою первую маркетинговую акцию", "reward_points": 50, "reward_xp": 50, "icon_key": "Gift"})
            store.insert("achievements", {"code": "first_customer", "title": "Первый клиент", "description": "Добавьте первого клиента в CRM", "reward_points": 50, "reward_xp": 50, "icon_key": "Users"})
            store.insert("achievements", {"code": "first_tool", "title": "Техногик", "description": "Активируйте первый инструмент в каталоге", "reward_points": 20, "reward_xp": 30, "icon_key": "Settings"})
        
        if not store.all("daily_tasks"):
            store.insert("daily_tasks", {"code": "CREATE_PROMOTION", "title": "Создать 1 акцию", "target_count": 1, "reward_points": 10, "reward_xp": 20})
            store.insert("daily_tasks", {"code": "ADD_CUSTOMER", "title": "Добавить 3 клиентов", "target_count": 3, "reward_points": 15, "reward_xp": 25})
            store.insert("daily_tasks", {"code": "ACTIVATE_TOOL", "title": "Активировать инструмент", "target_count": 1, "reward_points": 5, "reward_xp": 10})

    @staticmethod
    def trigger_event(user_id, event_type, count=1):
        GamificationService._seed_data()
        today = datetime.now(timezone.utc).date().isoformat()
        profile = GamificationService.get_or_create_profile(user_id)

        rewards_payload = []

        # 1. Update Daily Tasks
        tasks = store.filter("daily_tasks", code=event_type)
        for task in tasks:
            progress = store.first("user_task_progress", user_id=user_id, task_id=task["id"], date=today)
            if not progress:
                progress = store.insert("user_task_progress", {
                    "user_id": user_id,
                    "task_id": task["id"],
                    "date": today,
                    "current_count": 0,
                    "is_completed": False,
                    "is_claimed": False
                })
            
            if not progress["is_completed"]:
                progress["current_count"] += count
                is_now_completed = progress["current_count"] >= task["target_count"]
                
                store.update("user_task_progress", progress["id"], {
                    "current_count": progress["current_count"],
                    "is_completed": is_now_completed
                })

                if is_now_completed:
                    rewards_payload.append({
                        "type": "TASK_COMPLETED",
                        "title": f"Квест выполнен: {task['title']}",
                        "reward_points": task["reward_points"]
                    })

        # 2. Check Achievements
        ach_map = {
            'CREATE_PROMOTION': 'first_promo',
            'ADD_CUSTOMER': 'first_customer',
            'ACTIVATE_TOOL': 'first_tool'
        }
        
        ach_code = ach_map.get(event_type)
        if ach_code:
            ach = store.first("achievements", code=ach_code)
            if ach:
                has_ach = store.first("user_achievements", user_id=user_id, achievement_id=ach["id"])
                if not has_ach:
                    store.insert("user_achievements", {
                        "user_id": user_id,
                        "achievement_id": ach["id"],
                        "unlocked_at": GamificationService.now()
                    })
                    
                    # Update points and xp
                    profile["points"] += ach["reward_points"]
                    store.update("gamification_profiles", profile["id"], {"points": profile["points"]})
                    level_up = GamificationService._add_xp(profile, ach["reward_xp"])
                    
                    rewards_payload.append({
                        "type": "ACHIEVEMENT_UNLOCKED",
                        "title": "Новое достижение!",
                        "description": ach["title"],
                        "reward_points": ach["reward_points"],
                        "level_up": level_up
                    })

        return {"gamification_rewards": rewards_payload} if rewards_payload else None
