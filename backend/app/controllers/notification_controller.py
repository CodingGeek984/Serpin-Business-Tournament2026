import json
import time
import queue
from flask import request, Response
from flask_jwt_extended import jwt_required, decode_token

from controllers.common import access_denied, current_user_id, error, ok
from store import store
from services.notification_service import NotificationService


@jwt_required()
def get_notifications():
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))

    notifications = store.filter("notifications", user_id=current_user_id())
    
    if unread_only:
        notifications = [n for n in notifications if not n.get("is_read")]

    notifications.sort(
        key=lambda notification: notification.get("created_at", ""),
        reverse=True,
    )
    
    paginated = notifications[offset:offset + limit]
    return ok({
        "items": paginated,
        "total": len(notifications),
        "limit": limit,
        "offset": offset
    })

def stream_notifications():
    # SSE does not send auth headers easily, so we get token from query param
    token = request.args.get('token')
    if not token:
        return error("Missing token", 401)
    
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
    except Exception:
        return error("Invalid token", 401)

    def event_stream():
        q = NotificationService.listen(user_id)
        # Send initial ping to establish connection
        yield f"data: {json.dumps({'type': 'ping'})}\n\n"
        try:
            while True:
                # Block until message is available
                message = q.get(timeout=30)
                yield message
        except queue.Empty:
            # Prevent timeout disconnects with empty messages
            yield ": keepalive\n\n"
        except GeneratorExit:
            pass
        finally:
            NotificationService.unlisten(user_id, q)

    return Response(event_stream(), mimetype="text/event-stream")



@jwt_required()
def mark_as_read(notification_id):
    notification = store.find("notifications", notification_id)

    if notification is None:
        return error("Notification not found", 404)
    if notification["user_id"] != current_user_id():
        return access_denied()

    updated_notification = store.update(
        "notifications",
        notification_id,
        {"is_read": True},
    )
    return ok(updated_notification)


@jwt_required()
def mark_all_as_read():
    notifications = store.filter("notifications", user_id=current_user_id())
    updated_count = 0

    for notification in notifications:
        if notification.get("is_read"):
            continue
        store.update("notifications", notification["id"], {"is_read": True})
        updated_count += 1

    return ok({"updated": updated_count})

@jwt_required()
def delete_notification(notification_id):
    notification = store.find("notifications", notification_id)

    if notification is None:
        return error("Notification not found", 404)
    if notification["user_id"] != current_user_id():
        return access_denied()

    store.delete("notifications", notification_id)
    return ok({"deleted": True})


@jwt_required()
def delete_all_notifications():
    notifications = store.filter("notifications", user_id=current_user_id())
    deleted_count = 0

    for notification in notifications:
        store.delete("notifications", notification["id"])
        deleted_count += 1

    return ok({"deleted": deleted_count})
