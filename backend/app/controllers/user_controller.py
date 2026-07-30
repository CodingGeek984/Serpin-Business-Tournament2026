from flask import request
from flask_jwt_extended import jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from controllers.common import current_user_id, error, ok
from store import store
import re

class UserController:
    @staticmethod
    @jwt_required()
    def get_profile():
        user_id = current_user_id()
        user = store.find("users", user_id)
        if not user:
            return error("Пользователь не найден", 404)
        
        # Don't return password hash
        user_data = {k: v for k, v in user.items() if k != "password"}
        return ok(user_data)

    @staticmethod
    @jwt_required()
    def update_profile():
        user_id = current_user_id()
        data = request.get_json(silent=True) or {}
        
        user = store.find("users", user_id)
        if not user:
            return error("Пользователь не найден", 404)

        email = data.get("email", "").strip()
        if email:
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return error("Неверный формат email")
            
            # Check uniqueness if email is changed
            if email != user.get("email"):
                existing = store.filter("users", email=email)
                if existing:
                    return error("Этот email уже занят")
                user["email"] = email

        if "full_name" in data:
            user["full_name"] = data["full_name"].strip()
        if "phone" in data:
            user["phone"] = data["phone"].strip()
        if "avatar" in data:
            user["avatar"] = data["avatar"].strip()

        updated_user = store.update("users", user_id, user)
        user_data = {k: v for k, v in updated_user.items() if k != "password"}
        return ok(user_data, message="Профиль успешно обновлен")

    @staticmethod
    @jwt_required()
    def change_password():
        user_id = current_user_id()
        data = request.get_json(silent=True) or {}
        
        old_password = data.get("old_password", "")
        new_password = data.get("new_password", "")
        
        if not old_password or not new_password:
            return error("Текущий и новый пароли обязательны")
            
        if len(new_password) < 6:
            return error("Новый пароль должен содержать минимум 6 символов")

        user = store.find("users", user_id)
        if not user:
            return error("Пользователь не найден", 404)

        if not check_password_hash(user.get("password", ""), old_password):
            return error("Неверный текущий пароль")

        store.update("users", user_id, {"password": generate_password_hash(new_password)})
        return ok(message="Пароль успешно изменен")

    @staticmethod
    @jwt_required()
    def delete_account():
        user_id = current_user_id()
        store.delete("users", user_id)
        # Here we could also delete related business, promotions, etc.
        return ok(message="Аккаунт успешно удален")
