"""All HTTP endpoints are declared here.

Controllers hold request-handling logic; this module owns URL paths and methods.
"""
from flask import Blueprint

from controllers import admin_controller, ai_chat_controller
from controllers import analytics_controller
from controllers import auth_controller
from controllers import business_controller
from controllers import customer_controller
from controllers import notification_controller
from controllers import onboarding_controller
from controllers import promotion_controller
from controllers import recommendation_controller
from controllers import tool_controller
from controllers import template_controller


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
    app.register_blueprint(create_template_routes())
    app.register_blueprint(create_admin_routes())
    app.register_blueprint(create_user_routes())
    app.register_blueprint(create_gamification_routes())
    app.register_blueprint(create_business_tools_routes())
    app.register_blueprint(create_onboarding_routes())


def create_auth_routes():
    routes = Blueprint("auth", __name__, url_prefix="/api/auth")
    routes.add_url_rule("/register", view_func=auth_controller.register, methods=["POST"])
    routes.add_url_rule("/login", view_func=auth_controller.login, methods=["POST"])
    routes.add_url_rule("/logout", view_func=auth_controller.logout, methods=["POST"])
    routes.add_url_rule("/me", view_func=auth_controller.me, methods=["GET"])
    return routes


def create_business_routes():
    from controllers.business_controller import BusinessController
    routes = Blueprint("business", __name__, url_prefix="/api/business")
    routes.add_url_rule("/dashboard", view_func=BusinessController.get_dashboard, methods=["GET"])
    routes.add_url_rule("/profile", view_func=BusinessController.get_profile, methods=["GET"])
    routes.add_url_rule("/profile", view_func=BusinessController.update_profile, methods=["PUT"])
    routes.add_url_rule("/stats", view_func=BusinessController.get_stats, methods=["GET"])
    return routes


def create_tool_routes():
    from controllers.tool_controller import ToolController
    routes = Blueprint("tools", __name__, url_prefix="/api/tools")
    routes.add_url_rule("", view_func=ToolController.get_tools, methods=["GET"])
    routes.add_url_rule("/favorites", view_func=ToolController.get_favorites, methods=["GET"])
    routes.add_url_rule("/recommendations", view_func=ToolController.get_recommendations, methods=["GET"])
    routes.add_url_rule("/<slug>", view_func=ToolController.get_tool, methods=["GET"])
    routes.add_url_rule("/<tool_id>/favorite", view_func=ToolController.add_favorite, methods=["POST"])
    routes.add_url_rule("/<tool_id>/favorite", view_func=ToolController.delete_favorite, methods=["DELETE"])
    routes.add_url_rule("/<tool_id>/activate", view_func=ToolController.activate_tool, methods=["POST"])
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
    routes.add_url_rule("", view_func=recommendation_controller.RecommendationController.get_recommendations, methods=["GET"])
    routes.add_url_rule("/<recommendation_id>/dismiss", view_func=recommendation_controller.dismiss_recommendation, methods=["POST"])
    return routes


def create_onboarding_routes():
    routes = Blueprint("onboarding", __name__, url_prefix="/api/onboarding")
    routes.add_url_rule("", view_func=onboarding_controller.OnboardingController.complete, methods=["POST"])
    return routes


def create_notification_routes():
    routes = Blueprint("notifications", __name__, url_prefix="/api/notifications")
    routes.add_url_rule("", view_func=notification_controller.get_notifications, methods=["GET"])
    routes.add_url_rule("/stream", view_func=notification_controller.stream_notifications, methods=["GET"])
    routes.add_url_rule("/<notification_id>/read", view_func=notification_controller.mark_as_read, methods=["PATCH"])
    routes.add_url_rule("/<notification_id>", view_func=notification_controller.delete_notification, methods=["DELETE"])
    routes.add_url_rule("/all", view_func=notification_controller.delete_all_notifications, methods=["DELETE"])
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


def create_template_routes():
    routes = Blueprint("promotion_templates", __name__, url_prefix="/api/promotion-templates")
    routes.add_url_rule("", view_func=template_controller.get_templates, methods=["GET"])
    return routes


def create_admin_routes():
    from controllers.tool_controller import ToolController
    routes = Blueprint("admin", __name__, url_prefix="/api/admin")
    routes.add_url_rule("/summary", view_func=admin_controller.get_summary, methods=["GET"])
    routes.add_url_rule("/templates", view_func=template_controller.get_admin_templates, methods=["GET"])
    routes.add_url_rule("/templates", view_func=template_controller.create_template, methods=["POST"])
    routes.add_url_rule("/templates/<template_id>", view_func=template_controller.delete_template, methods=["DELETE"])
    routes.add_url_rule("/tools", view_func=ToolController.create_admin_tool, methods=["POST"])
    routes.add_url_rule("/tools/<tool_id>", view_func=ToolController.update_admin_tool, methods=["PUT"])
    routes.add_url_rule("/tools/<tool_id>", view_func=ToolController.delete_admin_tool, methods=["DELETE"])
    return routes


def create_user_routes():
    from controllers.user_controller import UserController
    routes = Blueprint("user", __name__, url_prefix="/api/user")
    routes.add_url_rule("/profile", view_func=UserController.get_profile, methods=["GET"])
    routes.add_url_rule("/profile", view_func=UserController.update_profile, methods=["PUT"])
    routes.add_url_rule("/change-password", view_func=UserController.change_password, methods=["PUT"])
    routes.add_url_rule("/account", view_func=UserController.delete_account, methods=["DELETE"])
    return routes

def create_gamification_routes():
    from controllers.gamification_controller import GamificationController
    routes = Blueprint("gamification", __name__, url_prefix="/api/gamification")
    routes.add_url_rule("/status", view_func=GamificationController.get_status, methods=["GET"])
    routes.add_url_rule("/claim-daily-reward", view_func=GamificationController.claim_daily_reward, methods=["POST"])
    routes.add_url_rule("/claim-task-reward", view_func=GamificationController.claim_task_reward, methods=["POST"])
    return routes

def create_business_tools_routes():
    from controllers.business_tools_controller import BusinessToolsController
    routes = Blueprint("business_tools", __name__, url_prefix="/api/business-tools")
    routes.add_url_rule("/launch", view_func=BusinessToolsController.launch_tool, methods=["POST"])
    routes.add_url_rule("/active", view_func=BusinessToolsController.get_active_tools, methods=["GET"])
    routes.add_url_rule("/simulate", view_func=BusinessToolsController.simulate_tool, methods=["POST"])
    routes.add_url_rule("/metrics/<tool_instance_id>", view_func=BusinessToolsController.get_tool_metrics, methods=["GET"])
    return routes
