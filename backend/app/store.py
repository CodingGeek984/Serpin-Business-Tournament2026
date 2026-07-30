
"""Tiny JSON repository used by the demo API.

It deliberately keeps persistence independent from an ORM, so the project can
run with its bundled dependencies.  Replace it with a database repository in
production without changing controller contracts.
"""
import json
import os
import threading
from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4


class FirestoreStore:
    """Firestore implementation with the same repository API as ``JsonStore``."""

    def __init__(self, service_account_path=None, project_id=None):
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            options = {"projectId": project_id} if project_id else None
            credential = credentials.Certificate(service_account_path) if service_account_path else None
            firebase_admin.initialize_app(credential, options)
        self.db = firestore.client()

    @staticmethod
    def now():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _item(snapshot):
        return {"id": snapshot.id, **snapshot.to_dict()}

    def _collection(self, collection):
        return self.db.collection(collection)

    def _create_default_tools(self):
        """Create the initial tool catalog when Firestore has no tools yet."""
        for name, slug, category, description in [
            ("CRM-клиенты", "crm", "Продажи", "Ведите базу клиентов и историю визитов."),
            ("Промо-акции", "promotions", "Маркетинг", "Создавайте акции и промокоды."),
            ("Аналитика", "analytics", "Аналитика", "Следите за выручкой и заказами."),
            ("AI-помощник", "ai-assistant", "Автоматизация", "Получайте идеи для роста бизнеса."),
        ]:
            tool = {
                "name": name,
                "slug": slug,
                "category": category,
                "description": description,
                "short_description": description,
                "icon": "",
                "badge": "",
                "features": [],
                "is_active": True,
                "is_featured": False,
            }
            self.insert("tools", tool)

    def all(self, collection):
        snapshots = list(self._collection(collection).stream())

        if collection == "tools" and not snapshots:
            self._create_default_tools()
            snapshots = list(self._collection(collection).stream())

        return [self._item(snapshot) for snapshot in snapshots]

    def find(self, collection, item_id):
        snapshot = self._collection(collection).document(str(item_id)).get()
        return self._item(snapshot) if snapshot.exists else None

    def first(self, collection, **filters):
        results = self.filter(collection, **filters)
        return results[0] if results else None

    def filter(self, collection, **filters):
        query = self._collection(collection)
        for field, value in filters.items():
            query = query.where(field, "==", value)
        return [self._item(snapshot) for snapshot in query.stream()]

    def insert(self, collection, values):
        reference = self._collection(collection).document()
        item = {"created_at": self.now(), **values}
        reference.set(item)
        return {"id": reference.id, **item}

    def update(self, collection, item_id, values):
        reference = self._collection(collection).document(str(item_id))
        if not reference.get().exists:
            return None
        updated = {**values, "updated_at": self.now()}
        reference.update(updated)
        return {"id": str(item_id), **reference.get().to_dict()}

    def delete(self, collection, item_id):
        reference = self._collection(collection).document(str(item_id))
        snapshot = reference.get()
        if not snapshot.exists:
            return None
        item = self._item(snapshot)
        reference.delete()
        return item


class JsonStore:
    collections = ("users", "businesses", "tools", "favorites", "promotions",
                   "customers", "analytics", "recommendations", "notifications",
                   "ai_chats", "ai_messages", "active_tools", "promotion_templates",
                   "gamification_profiles", "achievements", "user_achievements",
                   "daily_tasks", "user_task_progress")

    def __init__(self):
        self.path = os.environ.get("SERPIN_DATA_FILE", os.path.join(os.path.dirname(__file__), "data.json"))
        self.lock = threading.RLock()
        self.data = self._load()
        self._seed_tools()

    @staticmethod
    def now():
        return datetime.now(timezone.utc).isoformat()

    def _load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, encoding="utf-8") as file:
                    loaded = json.load(file)
                    return {name: loaded.get(name, []) for name in self.collections}
            except (OSError, json.JSONDecodeError):
                pass
        return {name: [] for name in self.collections}

    def _save(self):
        directory = os.path.dirname(self.path)
        if directory:
            os.makedirs(directory, exist_ok=True)
        temp = f"{self.path}.tmp"
        with open(temp, "w", encoding="utf-8") as file:
            json.dump(self.data, file, ensure_ascii=False, indent=2)
        os.replace(temp, self.path)

    def _seed_tools(self):
        tools = [
            ("Каждый 6-й кофе в подарок", "6th-coffee-free", "Удержание", "Настройте штамп-карту для лояльности. 5 покупок — 6-й бесплатно.", "Gift", "Популярно"),
            ("Счастливые часы (14:00 - 16:00)", "happy-hours", "Продажи", "Автоматическая скидка 15% в часы минимальной загрузки.", "Coffee", "Быстрый старт"),
            ("Бонусы за первую покупку", "welcome-bonus", "Маркетинг", "Дарите клиентам 500 тенге за регистрацию в вашей базе.", "Star", ""),
            ("Возврат ушедших клиентов (WhatsApp)", "whatsapp-return", "Автоматизация", "Автоматическая рассылка тем, кто не был у вас больше месяца.", "Mail", "Топ"),
            ("Скидка на повторный визит через 21 день", "return-21-days", "Удержание", "Триггерная рассылка с промокодом для возврата клиента.", "Percent", ""),
            ("Базовый отчёт по чекам и выручке", "basic-analytics", "Аналитика", "Наглядный дашборд с выручкой, средним чеком и частотой визитов.", "BarChart2", "")
        ]
        existing_tool_slugs = {tool.get("slug") for tool in self.data["tools"]}
        for name, slug, category, description, icon, badge in tools:
            if slug not in existing_tool_slugs:
                self.insert("tools", {
                    "name": name,
                    "slug": slug,
                    "category": category,
                    "description": description,
                    "short_description": description,
                    "icon": icon,
                    "badge": badge,
                    "features": [],
                    "is_active": True,
                    "is_featured": bool(badge)
                })

        # Promotion templates are real catalogue records, so recommendations can
        # return a ready-to-launch campaign and not just a textual suggestion.
        presets = [
            ("Приведи подругу", "bring-a-friend", "referral", "Дайте бонус обоим клиентам за рекомендацию."),
            ("Распродажа остатков", "clearance-sale", "discount", "Запустите ограниченную по времени распродажу."),
            ("Закрытая распродажа для постоянных клиентов", "private-sale", "discount", "Эксклюзивная акция для лояльных покупателей."),
        ]
        existing_template_slugs = {template.get("slug") for template in self.data["promotion_templates"]}
        for name, slug, template_type, description in presets:
            if slug not in existing_template_slugs:
                self.insert("promotion_templates", {
                    "name": name,
                    "slug": slug,
                    "type": template_type,
                    "default_budget": 0,
                    "description": description,
                    "is_active": True,
                })

        recommendation_tools = [
            ("Кофе + Десерт со скидкой 20%", "coffee-dessert-set", "Продажи", "Готовый набор для увеличения среднего чека."),
            ("Маникюр + Педикюр со скидкой", "manicure-pedicure-set", "Продажи", "Комплексная услуга для салона красоты."),
            ("3-я вещь в чеке за полцены", "third-item-half-price", "Продажи", "Акция для роста среднего чека в рознице."),
        ]
        for name, slug, category, description in recommendation_tools:
            if slug not in existing_tool_slugs:
                self.insert("tools", {
                    "name": name, "slug": slug, "category": category, "description": description,
                    "short_description": description, "icon": "Gift", "badge": "", "features": [],
                    "is_active": True, "is_featured": False,
                })

    def all(self, collection):
        with self.lock:
            return deepcopy(self.data[collection])

    def find(self, collection, item_id):
        return self.first(collection, id=str(item_id))

    def first(self, collection, **filters):
        with self.lock:
            for item in self.data[collection]:
                if all(item.get(key) == value for key, value in filters.items()):
                    return deepcopy(item)
        return None

    def filter(self, collection, **filters):
        with self.lock:
            return deepcopy([item for item in self.data[collection]
                             if all(item.get(key) == value for key, value in filters.items())])

    def insert(self, collection, values):
        with self.lock:
            item = {"id": str(uuid4()), "created_at": self.now(), **values}
            self.data[collection].append(item)
            self._save()
            return deepcopy(item)

    def update(self, collection, item_id, values):
        with self.lock:
            for item in self.data[collection]:
                if item["id"] == str(item_id):
                    item.update(values)
                    item["updated_at"] = self.now()
                    self._save()
                    return deepcopy(item)
        return None

    def delete(self, collection, item_id):
        with self.lock:
            for index, item in enumerate(self.data[collection]):
                if item["id"] == str(item_id):
                    deleted = self.data[collection].pop(index)
                    self._save()
                    return deepcopy(deleted)
        return None


def create_store():
    """Use Firestore when configured; otherwise use local JSON for development."""
    service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    project_id = os.environ.get("FIREBASE_PROJECT_ID")
    emulator = os.environ.get("FIRESTORE_EMULATOR_HOST")
    if service_account or project_id or emulator:
        if service_account and not os.path.isfile(service_account):
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT points to a missing file")
        return FirestoreStore(service_account, project_id)
    return JsonStore()


store = create_store()
