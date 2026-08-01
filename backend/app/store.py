
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
    """Firestore repository using the official Firestore REST API."""
    REQUEST_TIMEOUT_SECONDS = (5, 20)
    AUTH_ATTEMPTS = 3

    def __init__(self, service_account_path=None, project_id=None):
        if not service_account_path:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT is required for Firestore")
        if not os.path.isfile(service_account_path):
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT points to a missing file")

        with open(service_account_path, encoding="utf-8") as file:
            self.service_account = json.load(file)
        self.project_id = project_id or self.service_account.get("project_id")
        if not self.project_id:
            raise RuntimeError("FIREBASE_PROJECT_ID is required for Firestore")

        self.auth_lock = threading.RLock()
        self.base_url = (
            f"https://firestore.googleapis.com/v1/projects/{self.project_id}"
            "/databases/(default)/documents"
        )
        self.headers = {}
        self._authenticate()

    def _authenticate(self):
        """Get a fresh service-account token.

        Google access tokens are valid for about one hour.  Keeping this in a
        method (rather than only in ``__init__``) lets the store recover from a
        401 without restarting the Flask process.
        """
        import time
        from email.utils import parsedate_to_datetime
        import jwt
        import requests

        # Service-account JWTs require a clock close to Google's clock. The
        # development environment can have a shifted system time, so use the
        # Date header from Google's OAuth server when it is available.
        now = int(time.time())
        try:
            time_response = requests.head(
                "https://oauth2.googleapis.com/token", timeout=self.REQUEST_TIMEOUT_SECONDS
            )
            date_header = time_response.headers.get("Date")
            if date_header:
                now = int(parsedate_to_datetime(date_header).timestamp())
        except requests.RequestException:
            pass

        assertion = jwt.encode({
            "iss": self.service_account["client_email"],
            "sub": self.service_account["client_email"],
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600,
            "scope": "https://www.googleapis.com/auth/datastore",
        }, self.service_account["private_key"], algorithm="RS256")
        access_token = None
        last_error = None
        for attempt in range(self.AUTH_ATTEMPTS):
            try:
                token_response = requests.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                        "assertion": assertion,
                    },
                    timeout=self.REQUEST_TIMEOUT_SECONDS,
                )
                token_response.raise_for_status()
                access_token = token_response.json().get("access_token")
                if access_token:
                    break
            except requests.RequestException as exc:
                last_error = exc
                # Brief backoff handles a transient TLS/DNS issue on startup.
                if attempt < self.AUTH_ATTEMPTS - 1:
                    time.sleep(attempt + 1)
        if not access_token:
            raise RuntimeError("Firebase OAuth did not return an access token") from last_error
        self.headers = {"Authorization": f"Bearer {access_token}"}

    def _request(self, method, path, **kwargs):
        """Call Firestore and refresh the OAuth token once after a 401."""
        import requests

        def send():
            return requests.request(
                method, f"{self.base_url}/{path.lstrip('/')}", headers=self.headers,
                timeout=self.REQUEST_TIMEOUT_SECONDS, **kwargs,
            )

        response = send()
        if response.status_code != 401:
            return response
        # A second caller may already have refreshed the token; serialising the
        # refresh is safe and retrying once avoids an infinite loop on bad keys.
        with self.auth_lock:
            response = send()
            if response.status_code != 401:
                return response
            self._authenticate()
        return send()
        
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
        response = self._request("GET", collection)
        response.raise_for_status()
        documents = [self._item(document) for document in response.json().get("documents", [])]
        documents = [document for document in documents if document]
        
        if collection == "tools" and not documents:
            self._create_default_tools()
            documents = self.all(collection)
            
        if collection == "promotion_templates" and not documents:
            self._create_default_tools()
            documents = self.all(collection)
        return documents

    def find(self, collection, item_id):
        response = self._request("GET", f"{collection}/{item_id}")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return self._item(response.json())

    def first(self, collection, **filters):
        results = self.filter(collection, **filters)
        return results[0] if results else None

    def filter(self, collection, **filters):
        return [
            item for item in self.all(collection)
            if all(item.get(field) == value for field, value in filters.items())
        ]

    def insert(self, collection, values):
        item_id = str(uuid4())
        item = {"created_at": self.now(), **values}
        response = self._request("PATCH", f"{collection}/{item_id}", json={"fields": self.dict_to_rest(item)})
        response.raise_for_status()
        return {"id": item_id, **item}

    def update(self, collection, item_id, values):
        item = self.find(collection, item_id)
        if not item:
            return None
        updates = {**values, "updated_at": self.now()}
        response = self._request(
            "PATCH", f"{collection}/{item_id}",
            json={"fields": self.dict_to_rest({key: value for key, value in {**item, **updates}.items() if key != "id"})},
        )
        response.raise_for_status()
        return {**item, **updates}

    def delete(self, collection, item_id):
        item = self.find(collection, item_id)
        if not item:
            return None
        response = self._request("DELETE", f"{collection}/{item_id}")
        response.raise_for_status()
        return item


class JsonStore:
    collections = ("users", "businesses", "tools", "favorites", "promotions",
                   "customers", "analytics", "recommendations", "notifications",
                   "ai_chats", "ai_messages", "active_tools", "promotion_templates",
                   "gamification_profiles", "achievements", "user_achievements",
                   "daily_tasks", "user_task_progress", "transactions")

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
    try:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    except ImportError:
        pass
    service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    project_id = os.environ.get("FIREBASE_PROJECT_ID")
    if service_account or project_id:
        return FirestoreStore(service_account, project_id)
    return JsonStore()


store = create_store()
