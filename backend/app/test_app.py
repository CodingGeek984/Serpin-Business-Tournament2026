import requests

base = "http://127.0.0.1:5000/api"

req1 = requests.post(f"{base}/auth/login", json={
    "email": "test456@example.com",
    "password": "password123"
})
token = req1.json().get("data", {}).get("access_token")
headers = {"Authorization": f"Bearer {token}"}

tools = requests.get(f"{base}/tools", headers=headers).json().get("data", [])
print(f"Got {len(tools)} tools.")
if tools:
    first_tool_id = tools[0]["id"]
    print(f"Favoriting {first_tool_id}...")
    res1 = requests.post(f"{base}/tools/{first_tool_id}/favorite", headers=headers)
    print("Add favorite status:", res1.status_code)
    
    favs = requests.get(f"{base}/tools/favorites", headers=headers).json().get("data", [])
    print("Favorites count:", len(favs))
    
    res2 = requests.delete(f"{base}/tools/{first_tool_id}/favorite", headers=headers)
    print("Delete favorite status:", res2.status_code)
