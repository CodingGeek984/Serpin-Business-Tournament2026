class AIConversation:
    COLLECTION = "ai_conversations"

    def __init__(
        self,
        id=None,
        user_id="",
        title="Новый диалог",
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }