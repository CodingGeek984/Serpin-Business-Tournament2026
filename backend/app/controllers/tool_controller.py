from flask import request
from flask_jwt_extended import jwt_required

from controllers.common import current_user_id, error, ok
from store import store


def add_favorite_flag(tool):
    favorite = store.first(
        "favorites",
        user_id=current_user_id(),
        tool_id=tool["id"],
    )
    tool["is_favorite"] = favorite is not None
    return tool


@jwt_required()
def get_tools():
    category = request.args.get("category")
    result = []

    for tool in store.all("tools"):
        if not tool.get("is_active"):
            continue
        if category and tool.get("category") != category:
            continue
        result.append(add_favorite_flag(tool))

    return ok(result)


@jwt_required()
def get_favorites():
    favorites = store.filter("favorites", user_id=current_user_id())
    favorite_tool_ids = {favorite["tool_id"] for favorite in favorites}
    result = []

    for tool in store.all("tools"):
        if tool["id"] in favorite_tool_ids:
            result.append(add_favorite_flag(tool))

    return ok(result)


@jwt_required()
def get_tool(slug):
    tool = store.first("tools", slug=slug)

    if tool is None or not tool.get("is_active"):
        return error("Tool not found", 404)

    return ok(add_favorite_flag(tool))


@jwt_required()
def add_favorite(tool_id):
    tool = store.find("tools", tool_id)
    if tool is None:
        return error("Tool not found", 404)

    favorite = store.first(
        "favorites",
        user_id=current_user_id(),
        tool_id=tool_id,
    )
    if favorite is None:
        favorite = store.insert(
            "favorites",
            {"user_id": current_user_id(), "tool_id": tool_id},
        )

    return ok(favorite, 201)


@jwt_required()
def delete_favorite(tool_id):
    favorite = store.first(
        "favorites",
        user_id=current_user_id(),
        tool_id=tool_id,
    )
    if favorite is None:
        return error("Favorite not found", 404)

    store.delete("favorites", favorite["id"])
    return ok(message="Removed from favorites")
