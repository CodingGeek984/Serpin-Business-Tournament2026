from controllers.common import admin_required, ok
from store import store


@admin_required
def get_summary():
    businesses = store.all("businesses")
    promotions = store.all("promotions")
    customers = store.all("customers")
    return ok({
        "businesses": len(businesses),
        "active_promotions": sum(bool(item.get("is_active")) for item in promotions),
        "customers": len(customers),
    })
