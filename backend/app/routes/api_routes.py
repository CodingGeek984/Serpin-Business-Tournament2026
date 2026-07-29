"""All HTTP endpoints are declared here.

Controllers hold request-handling logic; this module owns URL paths and methods.
"""
from flask import Blueprint

from controllers import ai_chat_controller
from controllers import analytics_controller
from controllers import auth_controller
from controllers import business_controller
from controllers import customer_controller
from controllers import notification_controller
from controllers import promotion_controller
from controllers import recommendation_controller
from controllers import tool_controller


def register_routes(app):
    """Attach every API blueprint to the Flask application."""
    app.register_blueprint(create_auth_routes())
    app.register_blueprint(create_business_routes())
    app.register_blueprint(create_tool_routes())
    app.register_blueprint(create_promotion_routes())
    app.register_blueprint(create_customer_routes())
    app.register_blueprint(create_analytics_routes())
    app.register_blueprint(create_recommendation_routes())
    app.register_blueprint(create_notification_routes())
    app.register_blueprint(create_ai_chat_routes())


def create_auth_routes():
    routes = Blueprint("auth", __name__, url_prefix="/api/auth")
    routes.add_url_rule("/register", view_func=auth_controller.register, methods=["POST"])
    routes.add_url_rule("/login", view_func=auth_controller.login, methods=["POST"])
    routes.add_url_rule("/logout", view_func=auth_controller.logout, methods=["POST"])
    routes.add_url_rule("/me", view_func=auth_controller.me, methods=["GET"])
    return routes


def create_business_routes():
    routes = Blueprint("business", __name__, url_prefix="/api/business")
    routes.add_url_rule("", view_func=business_controller.get_business, methods=["GET"])
    routes.add_url_rule("", view_func=business_controller.update_business, methods=["PUT"])
    return routes


def create_tool_routes():
    routes = Blueprint("tools", __name__, url_prefix="/api/tools")
    routes.add_url_rule("", view_func=tool_controller.get_tools, methods=["GET"])
    routes.add_url_rule("/favorites", view_func=tool_controller.get_favorites, methods=["GET"])
    routes.add_url_rule("/<slug>", view_func=tool_controller.get_tool, methods=["GET"])
    routes.add_url_rule("/<tool_id>/favorite", view_func=tool_controller.add_favorite, methods=["POST"])
    routes.add_url_rule("/<tool_id>/favorite", view_func=tool_controller.delete_favorite, methods=["DELETE"])
    return routes


def create_promotion_routes():
    routes = Blueprint("promotions", __name__, url_prefix="/api/promotions")
    routes.add_url_rule("", view_func=promotion_controller.get_promotions, methods=["GET"])
    routes.add_url_rule("", view_func=promotion_controller.create_promotion, methods=["POST"])
    routes.add_url_rule("/<promotion_id>", view_func=promotion_controller.get_promotion, methods=["GET"])
    routes.add_url_rule("/<promotion_id>", view_func=promotion_controller.update_promotion, methods=["PUT"])
    routes.add_url_rule("/<promotion_id>", view_func=promotion_controller.delete_promotion, methods=["DELETE"])
    return routes


def create_customer_routes():
    routes = Blueprint("customers", __name__, url_prefix="/api/customers")
    routes.add_url_rule("", view_func=customer_controller.get_customers, methods=["GET"])
    routes.add_url_rule("", view_func=customer_controller.create_customer, methods=["POST"])
    routes.add_url_rule("/<customer_id>", view_func=customer_controller.get_customer, methods=["GET"])
    routes.add_url_rule("/<customer_id>", view_func=customer_controller.update_customer, methods=["PUT"])
    routes.add_url_rule("/<customer_id>", view_func=customer_controller.delete_customer, methods=["DELETE"])
    return routes


def create_analytics_routes():
    routes = Blueprint("analytics", __name__, url_prefix="/api/analytics")
    routes.add_url_rule("/summary", view_func=analytics_controller.get_summary, methods=["GET"])
    routes.add_url_rule("/record", view_func=analytics_controller.create_record, methods=["POST"])
    return routes


def create_recommendation_routes():
    routes = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")
    routes.add_url_rule("", view_func=recommendation_controller.get_recommendations, methods=["GET"])
    routes.add_url_rule("/<recommendation_id>/dismiss", view_func=recommendation_controller.dismiss_recommendation, methods=["POST"])
    return routes


def create_notification_routes():
    routes = Blueprint("notifications", __name__, url_prefix="/api/notifications")
    routes.add_url_rule("", view_func=notification_controller.get_notifications, methods=["GET"])
    routes.add_url_rule("/<notification_id>/read", view_func=notification_controller.mark_as_read, methods=["PATCH"])
    routes.add_url_rule("/read-all", view_func=notification_controller.mark_all_as_read, methods=["PATCH"])
    return routes


def create_ai_chat_routes():
    routes = Blueprint("ai_chats", __name__, url_prefix="/api/ai/chats")
    routes.add_url_rule("", view_func=ai_chat_controller.get_chats, methods=["GET"])
    routes.add_url_rule("", view_func=ai_chat_controller.create_chat, methods=["POST"])
    routes.add_url_rule("/<chat_id>", view_func=ai_chat_controller.delete_chat, methods=["DELETE"])
    routes.add_url_rule("/<chat_id>/messages", view_func=ai_chat_controller.get_messages, methods=["GET"])
    routes.add_url_rule("/<chat_id>/messages", view_func=ai_chat_controller.send_message, methods=["POST"])
    return routes
