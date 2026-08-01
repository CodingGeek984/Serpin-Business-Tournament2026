# Serpin Business Tournament 2026

## Backend

API подключается к **Firebase Firestore** через `firebase-admin`. Скачайте ключ
сервисного аккаунта в Firebase Console: **Project settings → Service accounts →
Generate new private key**, и не добавляйте его в Git. Затем экспортируйте:

```bash
export FIREBASE_SERVICE_ACCOUNT="/absolute/path/to/service-account.json"
export FIREBASE_PROJECT_ID="your-firebase-project-id"
export JWT_SECRET_KEY="a-long-random-production-secret"
```

Когда настроен `FIREBASE_SERVICE_ACCOUNT`, все коллекции (`users`, `businesses`,
`customers`, `promotions` и другие) хранятся в Firestore. Для локальной разработки
без Firebase используется fallback `backend/app/data.json`. Пример переменных есть
в `backend/.env.example`.

```bash
cd backend/app
../venv/bin/python app.py
```

Проверка доступности: `GET http://localhost:5000/api/health`.

Все бизнесовые маршруты требуют заголовок:

```text
Authorization: Bearer <access_token>
```

Регистрация `POST /api/auth/register` автоматически создаёт профиль бизнеса и
возвращает `access_token`. Полный набор реализованных маршрутов: auth, business,
tools/favorites, promotions, customers, analytics, recommendations, notifications
и `ai/chats` с локальным fallback-ответом до подключения внешней AI-модели.

Все пути и HTTP-методы находятся в `backend/app/routes/api_routes.py`.
Контроллеры в `backend/app/controllers` содержат только логику обработки запросов.
