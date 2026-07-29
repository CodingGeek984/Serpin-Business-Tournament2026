class Tool:
    COLLECTION = "tools"

    def __init__(
        self,
        id=None,
        name="",
        slug="",
        description="",
        short_description="",
        category="",
        icon="",
        badge="",
        is_active=True,
        is_featured=False,
        features=None,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.name = name
        self.slug = slug
        self.description = description
        self.short_description = short_description
        self.category = category
        self.icon = icon
        self.badge = badge
        self.is_active = is_active
        self.is_featured = is_featured
        self.features = features if features is not None else []
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "short_description": self.short_description,
            "category": self.category,
            "icon": self.icon,
            "badge": self.badge,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "features": self.features,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }