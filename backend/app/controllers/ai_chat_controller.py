from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import access_denied, current_user_id, error, ok
from store import store


def get_owned_chat(chat_id):
    chat = store.find("ai_chats", chat_id)
    if chat is None:
        return None, error("Chat not found", 404)
    if chat["user_id"] != current_user_id():
        return None, access_denied()
    return chat, None


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
    chat, failure = get_owned_chat(chat_id)
    if failure:
        return failure

    store.delete("ai_chats", chat_id)
    messages = store.filter("ai_messages", chat_id=chat_id)
    for message in messages:
        store.delete("ai_messages", message["id"])

    return ok(message="Chat deleted")


@jwt_required()
def get_messages(chat_id):
    chat, failure = get_owned_chat(chat_id)
    if failure:
        return failure

    messages = store.filter("ai_messages", chat_id=chat_id)
    return ok(messages)


@jwt_required()
def send_message(chat_id):
    chat, failure = get_owned_chat(chat_id)
    if failure:
        return failure

    data = request.get_json(silent=True) or {}
    content = str(data.get("content", "")).strip()
    if not content:
        return error("content is required")

    user_message = store.insert(
        "ai_messages",
        {"chat_id": chat_id, "role": "user", "content": content},
    )

    import os
    try:
        import google.generativeai as genai
    except ImportError:
        genai = None

    api_key = os.environ.get("GEMINI_API_KEY")
    reply_text = ""

    if api_key and genai:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Build history from previous messages (excluding the one just inserted)
            # Gemini expects roles "user" and "model"
            all_messages = store.filter("ai_messages", chat_id=chat_id)
            history = []
            for msg in all_messages:
                if msg["id"] == user_message["id"]:
                    continue # Skip current message
                role = "model" if msg.get("role") == "assistant" else "user"
                history.append({
                    "role": role,
                    "parts": [msg.get("content", "")]
                })
                
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(content)
            reply_text = response.text
        except Exception as e:
            reply_text = f"Ошибка генерации ответа AI: {str(e)}"
    else:
        reply_text = (
            "Принял запрос. Установите google-generativeai и переменную "
            "окружения GEMINI_API_KEY, чтобы получать генеративные ответы."
        )

    reply = store.insert(
        "ai_messages",
        {
            "chat_id": chat_id,
            "role": "assistant",
            "content": reply_text,
        },
    )
    store.update("ai_chats", chat_id, {})

    return ok({"message": user_message, "reply": reply}, 201)

