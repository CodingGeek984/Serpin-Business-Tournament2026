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

    def _create_default_promotion_templates(self):
        for name, template_type, default_budget, description in [
            ("Скидка на чек", "discount", 5000, "Дайте клиенту скидку в процентах или фиксированной сумме."),
            ("Штамп-карта 5+1", "stamp", 0, "Каждая шестая покупка в подарок для роста LTV."),
            ("Счастливые часы", "time_discount", 2000, "Скидка в определённые часы для заполнения тихих периодов."),
            ("Возврат клиента", "winback", 10000, "Сообщение клиентам, которые давно не возвращались."),
        ]:
            self.insert("promotion_templates", {
                "name": name, "type": template_type, "default_budget": default_budget,
                "description": description, "is_active": True,
            })

    def all(self, collection):
        snapshots = list(self._collection(collection).stream())

        if collection == "tools" and not snapshots:
            self._create_default_tools()
            snapshots = list(self._collection(collection).stream())
        if collection == "promotion_templates" and not snapshots:
            self._create_default_promotion_templates()
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
                   "ai_chats", "ai_messages", "promotion_templates")

    def __init__(self):
        self.path = os.environ.get("SERPIN_DATA_FILE", os.path.join(os.path.dirname(__file__), "data.json"))
        self.lock = threading.RLock()
        self.data = self._load()
        self._seed_tools()
        self._seed_promotion_templates()

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
        if self.data["tools"]:
            return
        for name, slug, category, description in [
            ("CRM-клиенты", "crm", "Продажи", "Ведите базу клиентов и историю визитов."),
            ("Промо-акции", "promotions", "Маркетинг", "Создавайте акции и промокоды."),
            ("Аналитика", "analytics", "Аналитика", "Следите за выручкой и заказами."),
            ("AI-помощник", "ai-assistant", "Автоматизация", "Получайте идеи для роста бизнеса."),
        ]:
            self.insert("tools", {"name": name, "slug": slug, "category": category,
                                  "description": description, "short_description": description,
                                  "icon": "", "badge": "", "features": [], "is_active": True,
                                  "is_featured": False})

    def _seed_promotion_templates(self):
        if self.data["promotion_templates"]:
            return
        for name, template_type, default_budget, description in [
            ("Скидка на чек", "discount", 5000, "Дайте клиенту скидку в процентах или фиксированной сумме."),
            ("Штамп-карта 5+1", "stamp", 0, "Каждая шестая покупка в подарок для роста LTV."),
            ("Счастливые часы", "time_discount", 2000, "Скидка в определённые часы для заполнения тихих периодов."),
            ("Возврат клиента", "winback", 10000, "Сообщение клиентам, которые давно не возвращались."),
        ]:
            self.insert("promotion_templates", {
                "name": name, "type": template_type, "default_budget": default_budget,
                "description": description, "is_active": True,
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
