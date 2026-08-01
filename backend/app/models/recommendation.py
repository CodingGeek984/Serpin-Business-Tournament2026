class Recommendation:
    COLLECTION = "recommendations"

    def __init__(
        self,
        id=None,
        business_id="",
        title="",
        description="",
        category="",
        action_type="",
        action_payload=None,
        is_dismissed=False,
        created_at=None,
    ):
        self.id = id
        self.business_id = business_id
        self.title = title
        self.description = description
        self.category = category
        self.action_type = action_type
        self.action_payload = action_payload if action_payload is not None else {}
        self.is_dismissed = is_dismissed
        self.created_at = created_at

    def to_dict(self):
        return {
            "business_id": self.business_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "action_type": self.action_type,
            "action_payload": self.action_payload,
            "is_dismissed": self.is_dismissed,
            "created_at": self.created_at,
        }