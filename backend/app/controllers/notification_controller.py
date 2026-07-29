from flask_jwt_extended import jwt_required

from controllers.common import access_denied, current_user_id, error, ok
from store import store


@jwt_required()
def get_notifications():
    notifications = store.filter("notifications", user_id=current_user_id())
    notifications.sort(
        key=lambda notification: notification["created_at"],
        reverse=True,
    )
    return ok(notifications)


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
