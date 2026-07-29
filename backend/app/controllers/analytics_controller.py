from datetime import date

from flask import request

from controllers.common import business_required, current_business, error, ok
from store import store


METRIC_FIELDS = (
    "revenue",
    "orders_count",
    "new_customers",
    "active_promotions_used",
)


@business_required
def get_summary():
    start_date = request.args.get("from")
    end_date = request.args.get("to")
    business = current_business()
    records = store.filter("analytics", business_id=business["id"])

    records = filter_by_period(records, start_date, end_date)
    summary = {
        "from": start_date,
        "to": end_date,
        "records_count": len(records),
        "revenue": sum(float(record.get("revenue", 0)) for record in records),
        "orders_count": sum(int(record.get("orders_count", 0)) for record in records),
        "new_customers": sum(int(record.get("new_customers", 0)) for record in records),
        "active_promotions_used": sum(
            int(record.get("active_promotions_used", 0))
            for record in records
        ),
        "records": records,
    }
    return ok(summary)


def filter_by_period(records, start_date, end_date):
    filtered_records = []

    for record in records:
        record_date = record["date"]
        if start_date and record_date < start_date:
            continue
        if end_date and record_date > end_date:
            continue
        filtered_records.append(record)

    return filtered_records


@business_required
def create_record():
    data = request.get_json(silent=True) or {}
    record_date = data.get("date", date.today().isoformat())

    try:
        date.fromisoformat(record_date)
    except (TypeError, ValueError):
        return error("date must use YYYY-MM-DD")

    metrics = {}
    for field in METRIC_FIELDS:
        value = data.get(field, 0)
        if not isinstance(value, (int, float)) or value < 0:
            return error("metrics must be non-negative numbers")
        metrics[field] = value

    metrics["business_id"] = current_business()["id"]
    metrics["date"] = record_date

    created_record = store.insert("analytics", metrics)
    return ok(created_record, 201)
