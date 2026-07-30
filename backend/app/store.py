
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
    """Firestore REST implementation bypassing gRPC and clock skew."""

    def __init__(self, service_account_path=None, project_id=None):
        import json, requests, jwt, time
        from email.utils import parsedate_to_datetime
        
        self.project_id = project_id
        self.base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
        self._cache = {}  # In-memory cache to speed up reads
        
        # 1. Fetch real current time from Google to avoid 2026 skew
        time_res = requests.head("https://oauth2.googleapis.com/token")
        real_now = int(parsedate_to_datetime(time_res.headers["Date"]).timestamp())
        
        with open(service_account_path) as f:
            sa = json.load(f)
            
        payload = {
            "iss": sa["client_email"], "sub": sa["client_email"],
            "aud": "https://oauth2.googleapis.com/token",
            "iat": real_now, "exp": real_now + 3600,
            "scope": "https://www.googleapis.com/auth/datastore"
        }
        encoded_jwt = jwt.encode(payload, sa["private_key"], algorithm="RS256")
        res = requests.post("https://oauth2.googleapis.com/token", data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": encoded_jwt
        }).json()
        self.token = res.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
    @staticmethod
    def now():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def dict_to_rest_val(v):
        if isinstance(v, str): return {"stringValue": v}
        if isinstance(v, bool): return {"booleanValue": v}
        if isinstance(v, int): return {"integerValue": str(v)}
        if isinstance(v, float): return {"doubleValue": float(v)}
        if isinstance(v, list): return {"arrayValue": {"values": [FirestoreStore.dict_to_rest_val(x) for x in v]}}
        if isinstance(v, dict): return {"mapValue": {"fields": FirestoreStore.dict_to_rest(v)}}
        if v is None: return {"nullValue": None}
        return {"stringValue": str(v)}

    @staticmethod
    def dict_to_rest(d):
        return {k: FirestoreStore.dict_to_rest_val(v) for k, v in d.items()}

    @staticmethod
    def rest_val_to_dict(v):
        if "stringValue" in v: return v["stringValue"]
        if "integerValue" in v: return int(v["integerValue"])
        if "doubleValue" in v: return float(v["doubleValue"])
        if "booleanValue" in v: return v["booleanValue"]
        if "arrayValue" in v: return [FirestoreStore.rest_val_to_dict(x) for x in v["arrayValue"].get("values", [])]
        if "mapValue" in v: return FirestoreStore.rest_to_dict(v["mapValue"].get("fields", {}))
        if "nullValue" in v: return None
        return None

    @staticmethod
    def rest_to_dict(fields):
        return {k: FirestoreStore.rest_val_to_dict(v) for k, v in fields.items()}
        
    def _item(self, document):
        if not document or "name" not in document: return None
        doc_id = document["name"].split("/")[-1]
        data = self.rest_to_dict(document.get("fields", {}))
        return {"id": doc_id, **data}

    def _create_default_tools(self):
        for name, slug, category, description in [
            ("CRM-клиенты", "crm", "Продажи", "Ведите базу клиентов и историю визитов."),
            ("Промо-акции", "promotions", "Маркетинг", "Создавайте акции и промокоды."),
            ("Аналитика", "analytics", "Аналитика", "Следите за выручкой и заказами."),
            ("AI-помощник", "ai-assistant", "Автоматизация", "Получайте идеи для роста бизнеса."),
        ]:
            self.insert("tools", {
                "name": name, "slug": slug, "category": category,
                "description": description, "short_description": description,
                "icon": "", "badge": "", "features": [],
                "is_active": True, "is_featured": False,
            })
            
        for name, slug, template_type, description in [
            ("Приведи подругу", "bring-a-friend", "referral", "Дайте бонус обоим клиентам за рекомендацию."),
            ("Распродажа остатков", "clearance-sale", "discount", "Запустите ограниченную по времени распродажу."),
            ("Закрытая распродажа для постоянных клиентов", "private-sale", "discount", "Эксклюзивная акция для лояльных покупателей."),
        ]:
            self.insert("promotion_templates", {
                "name": name, "slug": slug, "type": template_type,
                "default_budget": 0, "description": description, "is_active": True,
            })

    def all(self, collection):
        if collection in self._cache:
            return list(self._cache[collection].values())

        import requests
        res = requests.get(f"{self.base_url}/{collection}", headers=self.headers).json()
        documents = [self._item(doc) for doc in res.get("documents", []) if self._item(doc)]
        
        if collection == "tools" and not documents:
            self._create_default_tools()
            res = requests.get(f"{self.base_url}/{collection}", headers=self.headers).json()
            documents = [self._item(doc) for doc in res.get("documents", []) if self._item(doc)]
            
        if collection == "promotion_templates" and not documents:
            self._create_default_tools()
            res = requests.get(f"{self.base_url}/{collection}", headers=self.headers).json()
            documents = [self._item(doc) for doc in res.get("documents", []) if self._item(doc)]
            
        self._cache[collection] = {doc["id"]: doc for doc in documents}
        return list(self._cache[collection].values())

    def find(self, collection, item_id):
        import requests
        res = requests.get(f"{self.base_url}/{collection}/{item_id}", headers=self.headers)
        if res.status_code != 200: return None
        return self._item(res.json())

    def first(self, collection, **filters):
        results = self.filter(collection, **filters)
        return results[0] if results else None

    def filter(self, collection, **filters):
        # Local filter since REST API simple queries are complex
        all_items = self.all(collection)
        results = []
        for item in all_items:
            if all(item.get(k) == v for k, v in filters.items()):
                results.append(item)
        return results

    def insert(self, collection, values):
        import requests
        from uuid import uuid4
        item_id = str(uuid4())
        item = {"created_at": self.now(), **values}
        url = f"{self.base_url}/{collection}/{item_id}"
        payload = {"fields": self.dict_to_rest(item)}
        requests.patch(url, headers=self.headers, json=payload)
        
        doc = {"id": item_id, **item}
        if collection in self._cache:
            self._cache[collection][item_id] = doc
        return doc

    def update(self, collection, item_id, values):
        import requests
        item = self.find(collection, item_id)
        if not item: return None
        updated = {**item, **values, "updated_at": self.now()}
        if "id" in updated:
            del updated["id"] # don't upload id as a field
            
        url = f"{self.base_url}/{collection}/{item_id}"
        payload = {"fields": self.dict_to_rest(updated)}
        requests.patch(url, headers=self.headers, json=payload)
        
        doc = {"id": str(item_id), **updated}
        if collection in self._cache:
            self._cache[collection][str(item_id)] = doc
        return doc

    def delete(self, collection, item_id):
        import requests
        item = self.find(collection, item_id)
        if not item: return None
        requests.delete(f"{self.base_url}/{collection}/{item_id}", headers=self.headers)
        
        if collection in self._cache and str(item_id) in self._cache[collection]:
            del self._cache[collection][str(item_id)]
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
