class User:
    COLLECTION = "users"

    def __init__(
        self,
        id=None,
        full_name="",
        email="",
        password="",
        business_name="",
        business_type="",
        business_size="",
        goal="",
        role="business",
        created_at=None,
    ):
        self.id = id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.business_name = business_name
        self.business_type = business_type
        self.business_size = business_size
        self.goal = goal
        self.role = role
        self.created_at = created_at

    def to_dict(self):
        return {
            "full_name": self.full_name,
            "email": self.email,
            "password": self.password,
            "business_name": self.business_name,
            "business_type": self.business_type,
            "business_size": self.business_size,
            "goal": self.goal,
            "role": self.role,
            "created_at": self.created_at,
        }

    