class Customer:
    COLLECTION = "customers"

    def __init__(
        self,
        id=None,
        business_id="",
        name="",
        phone="",
        email="",
        total_spent=0.0,
        visits_count=0,
        bonuses=0,
        tags=None,
        last_visit=None,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.business_id = business_id
        self.name = name
        self.phone = phone
        self.email = email
        self.total_spent = total_spent
        self.visits_count = visits_count
        self.bonuses = bonuses
        self.tags = tags if tags is not None else []
        self.last_visit = last_visit
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "business_id": self.business_id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "total_spent": self.total_spent,
            "visits_count": self.visits_count,
            "bonuses": self.bonuses,
            "tags": self.tags,
            "last_visit": self.last_visit,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    