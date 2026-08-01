class Favorite:
    COLLECTION = "favorites"

    def __init__(self, id=None, user_id="", tool_id="", created_at=None):
        self.id = id
        self.user_id = user_id
        self.tool_id = tool_id
        self.created_at = created_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "tool_id": self.tool_id,
            "created_at": self.created_at,
        }

    