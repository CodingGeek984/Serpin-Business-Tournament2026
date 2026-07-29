from controllers.common import business_required, current_business, error, ok
from store import store


@business_required
def get_recommendations():
    business = current_business()
    all_recommendations = store.filter(
        "recommendations",
        business_id=business["id"],
    )
    active_recommendations = []

    for recommendation in all_recommendations:
        if not recommendation.get("is_dismissed"):
            active_recommendations.append(recommendation)

    return ok(active_recommendations)


@business_required
def dismiss_recommendation(recommendation_id):
    recommendation = store.find("recommendations", recommendation_id)
    business = current_business()

    if recommendation is None or recommendation["business_id"] != business["id"]:
        return error("Recommendation not found", 404)

    updated_recommendation = store.update(
        "recommendations",
        recommendation_id,
        {"is_dismissed": True},
    )
    return ok(updated_recommendation)
