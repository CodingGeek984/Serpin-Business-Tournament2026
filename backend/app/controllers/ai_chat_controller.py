from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_user_id, error, ok
from store import store


def get_owned_chat(chat_id):
    chat = store.find("ai_chats", chat_id)

    if chat is None or chat["user_id"] != current_user_id():
        return None

    return chat


@jwt_required()
def get_chats():
    chats = store.filter("ai_chats", user_id=current_user_id())
    chats.sort(
        key=lambda chat: chat.get("updated_at", chat["created_at"]),
        reverse=True,
    )
    return ok(chats)


@jwt_required()
def create_chat():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "Новый диалог")).strip()

    if not title:
        title = "Новый диалог"

    chat = store.insert(
        "ai_chats",
        {"user_id": current_user_id(), "title": title},
    )
    return ok(chat, 201)


@jwt_required()
def delete_chat(chat_id):
    chat = get_owned_chat(chat_id)
    if chat is None:
        return error("Chat not found", 404)

    store.delete("ai_chats", chat_id)
    messages = store.filter("ai_messages", chat_id=chat_id)
    for message in messages:
        store.delete("ai_messages", message["id"])

    return ok(message="Chat deleted")


@jwt_required()
def get_messages(chat_id):
    chat = get_owned_chat(chat_id)
    if chat is None:
        return error("Chat not found", 404)

    messages = store.filter("ai_messages", chat_id=chat_id)
    return ok(messages)


@jwt_required()
def send_message(chat_id):
    chat = get_owned_chat(chat_id)
    if chat is None:
        return error("Chat not found", 404)

    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return error("text is required")

    user_message = store.insert(
        "ai_messages",
        {"chat_id": chat_id, "sender": "user", "text": text},
    )
    reply = store.insert(
        "ai_messages",
        {
            "chat_id": chat_id,
            "sender": "assistant",
            "text": (
                "Принял запрос. Подключите AI-провайдер в production, "
                "чтобы получать генеративные ответы."
            ),
        },
    )
    store.update("ai_chats", chat_id, {})

    return ok({"message": user_message, "reply": reply}, 201)
