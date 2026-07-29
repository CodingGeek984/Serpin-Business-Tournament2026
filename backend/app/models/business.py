class Business:
    COLLECTION = "businesses"

    def __init__(
        self,
        id=None,
        user_id="",
        name="",
        business_type="",
        business_size="",
        description="",
        logo_url="",
        phone="",
        address="",
        website="",
        social_links=None,
        working_hours=None,
        goals=None,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.business_type = business_type
        self.business_size = business_size
        self.description = description
        self.logo_url = logo_url
        self.phone = phone
        self.address = address
        self.website = website
        self.social_links = social_links if social_links is not None else {}
        self.working_hours = working_hours if working_hours is not None else {}
        self.goals = goals if goals is not None else []
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "business_type": self.business_type,
            "business_size": self.business_size,
            "description": self.description,
            "logo_url": self.logo_url,
            "phone": self.phone,
            "address": self.address,
            "website": self.website,
            "social_links": self.social_links,
            "working_hours": self.working_hours,
            "goals": self.goals,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    