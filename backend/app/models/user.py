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
        primary_goals=None,
        is_onboarding_completed=False,
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
        self.primary_goals = primary_goals if primary_goals is not None else []
        self.is_onboarding_completed = is_onboarding_completed
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
            "primary_goals": self.primary_goals,
            "is_onboarding_completed": self.is_onboarding_completed,
            "role": self.role,
            "created_at": self.created_at,
        }

    
