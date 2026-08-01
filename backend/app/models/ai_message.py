class AIMessage:
    COLLECTION = "ai_messages"

    def __init__(
        self,
        id=None,
        conversation_id="",
        sender="user",
        text="",
        created_at=None,
    ):
        self.id = id
        self.conversation_id = conversation_id
        self.sender = sender
        self.text = text
        self.created_at = created_at

    def to_dict(self):
        return {
            "conversation_id": self.conversation_id,
            "sender": self.sender,
            "text": self.text,
            "created_at": self.created_at,
        }