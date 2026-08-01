"""Analytics based on persisted business records, never generated data on read."""
from collections import defaultdict
from datetime import date, datetime, timedelta

from flask import request

from controllers.common import business_required, current_business, error, ok
from store import store


METRIC_FIELDS = ("revenue", "orders_count", "new_customers", "active_promotions_used")


def _number(value, field):
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0:
        raise ValueError(f"{field} must be a non-negative number")
    return value


@business_required
def create_record():
    business = current_business()
    data = request.get_json(silent=True) or {}
    record_date = data.get("date", date.today().isoformat())
    try:
        date.fromisoformat(record_date)
    except (TypeError, ValueError):
        return error("date must use YYYY-MM-DD")

    # QR simulator produces an actual promotion conversion instead of a fake metric.
    if data.get("event_type") == "scan":
        promotion_id = data.get("promotion_id")
        promotion = store.find("promotions", promotion_id) if promotion_id else None
        if not promotion or promotion.get("business_id") != business["id"]:
            return error("Promotion not found", 404)
        updated = store.update("promotions", promotion_id, {
            "views": int(promotion.get("views", 0) or 0) + 1,
            "conversions": int(promotion.get("conversions", 0) or 0) + 1,
            "usage_count": int(promotion.get("usage_count", 0) or 0) + 1,
        })
        return ok({"event": "scan", "promotion": updated}, 201)

    try:
        metrics = {field: _number(data.get(field, 0), field) for field in METRIC_FIELDS}
    except ValueError as exc:
        return error(str(exc))
    metrics.update({"business_id": business["id"], "date": record_date})
    return ok(store.insert("analytics", metrics), 201)


@business_required
def get_summary():
    business = current_business()
    try:
        days = min(max(int(request.args.get("days", 30)), 1), 365)
    except ValueError:
        return error("days must be a number")
    start = date.today() - timedelta(days=days - 1)
    records = [r for r in store.filter("analytics", business_id=business["id"])
               if _parse_date(r.get("date")) and _parse_date(r["date"]) >= start]
    customers = store.filter("customers", business_id=business["id"])
    promotions = store.filter("promotions", business_id=business["id"])

    total_revenue = sum(float(r.get("revenue", 0) or 0) for r in records)
    total_orders = sum(int(r.get("orders_count", 0) or 0) for r in records)
    total_new_customers = sum(int(r.get("new_customers", 0) or 0) for r in records)
    returning = sum(1 for c in customers if int(c.get("visits_count", c.get("visits", 0)) or 0) > 1)
    retention = round(returning / len(customers) * 100, 1) if customers else 0

    by_date = defaultdict(lambda: {"revenue": 0, "orders": 0, "newCustomers": 0})
    for record in records:
        item = by_date[record["date"]]
        item["revenue"] += float(record.get("revenue", 0) or 0)
        item["orders"] += int(record.get("orders_count", 0) or 0)
        item["newCustomers"] += int(record.get("new_customers", 0) or 0)
    chart = [{"date": day, **values} for day, values in sorted(by_date.items())]
    roi = [{
        "id": promotion["id"], "title": promotion.get("title", "Акция"),
        "revenue": float(promotion.get("revenue_generated", 0) or 0),
        "usageCount": int(promotion.get("conversions", promotion.get("usage_count", 0)) or 0),
    } for promotion in promotions]
    roi.sort(key=lambda item: item["revenue"], reverse=True)

    insights = []
    if not records:
        insights.append("Добавьте первую дневную запись продаж — после этого здесь появится динамика и рекомендации.")
    if customers and retention < 20:
        insights.append("Повторные покупки ниже 20%. Запустите предложение на следующий визит или программу лояльности.")
    if total_orders and total_revenue / total_orders < 3000:
        insights.append("Средний чек ниже 3 000 ₸. Попробуйте комбо-набор или допродажу.")
    if not insights:
        insights.append("Данные выглядят стабильно. Проверьте эффективность активных акций и масштабируйте лучшие механики.")
    return ok({
        "summary": {"totalRevenue": total_revenue, "totalOrders": total_orders,
                    "avgCheck": round(total_revenue / total_orders) if total_orders else 0,
                    "newCustomers": total_new_customers, "retentionRate": retention},
        "chartData": chart,
        "promotionsROI": roi,
        "insights": insights,
    })


def _parse_date(value):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None
