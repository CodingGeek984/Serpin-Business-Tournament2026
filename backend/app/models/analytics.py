class Analytics:
    COLLECTION = "analytics"

    def __init__(
        self,
        id=None,
        business_id="",
        date="",
        revenue=0.0,
        orders_count=0,
        new_customers=0,
        active_promotions_used=0,
        created_at=None,
    ):
        self.id = id
        self.business_id = business_id
        self.date = date
        self.revenue = revenue
        self.orders_count = orders_count
        self.new_customers = new_customers
        self.active_promotions_used = active_promotions_used
        self.created_at = created_at

    def to_dict(self):
        return {
            "business_id": self.business_id,
            "date": self.date,
            "revenue": self.revenue,
            "orders_count": self.orders_count,
            "new_customers": self.new_customers,
            "active_promotions_used": self.active_promotions_used,
            "created_at": self.created_at,
        }

    