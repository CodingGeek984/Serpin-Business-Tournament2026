class Promotion:
    COLLECTION = "promotions"

    def __init__(
        self,
        id=None,
        business_id="",
        title="",
        description="",
        promo_code="",
        discount_type="percentage",
        discount_value=0,
        start_date=None,
        end_date=None,
        is_active=True,
        usage_count=0,
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.business_id = business_id
        self.title = title
        self.description = description
        self.promo_code = promo_code
        self.discount_type = discount_type
        self.discount_value = discount_value
        self.start_date = start_date
        self.end_date = end_date
        self.is_active = is_active
        self.usage_count = usage_count
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "business_id": self.business_id,
            "title": self.title,
            "description": self.description,
            "promo_code": self.promo_code,
            "discount_type": self.discount_type,
            "discount_value": self.discount_value,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "is_active": self.is_active,
            "usage_count": self.usage_count,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }