class Notification:
    COLLECTION = "notifications"

    def __init__(
        self,
        id=None,
        user_id="",
        title="",
        message="",
        type="info",
        is_read=False,
        created_at=None,
    ):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.message = message
        self.type = type
        self.is_read = is_read
        self.created_at = created_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at,
        }