import os, json, requests, jwt, uuid
from email.utils import parsedate_to_datetime

os.environ["FIREBASE_SERVICE_ACCOUNT"] = "/home/danik/Serpin-Business-Tournament2026/backend/app/serpin-business-tournament2026-699aac43ca43.json"
os.environ["FIREBASE_PROJECT_ID"] = "serpin-business-tournament2026"

def get_token():
    time_res = requests.head("https://oauth2.googleapis.com/token")
    real_now = int(parsedate_to_datetime(time_res.headers["Date"]).timestamp())
    with open(os.environ["FIREBASE_SERVICE_ACCOUNT"]) as f:
        sa = json.load(f)
    payload = {
        "iss": sa["client_email"], "sub": sa["client_email"],
        "aud": "https://oauth2.googleapis.com/token",
        "iat": real_now, "exp": real_now + 3600,
        "scope": "https://www.googleapis.com/auth/datastore"
    }
    encoded_jwt = jwt.encode(payload, sa["private_key"], algorithm="RS256")
    res = requests.post("https://oauth2.googleapis.com/token", data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": encoded_jwt
    }).json()
    return res.get("access_token")

token = get_token()
project = os.environ["FIREBASE_PROJECT_ID"]
base_url = f"https://firestore.googleapis.com/v1/projects/{project}/databases/(default)/documents"

def dict_to_rest_val(v):
    if isinstance(v, str): return {"stringValue": v}
    if isinstance(v, bool): return {"booleanValue": v}
    if isinstance(v, int): return {"integerValue": str(v)}
    if isinstance(v, float): return {"doubleValue": float(v)}
    if isinstance(v, list): return {"arrayValue": {"values": [dict_to_rest_val(x) for x in v]}}
    if isinstance(v, dict): return {"mapValue": {"fields": dict_to_rest(v)}}
    if v is None: return {"nullValue": None}
    return {"stringValue": str(v)}

def dict_to_rest(d):
    return {k: dict_to_rest_val(v) for k, v in d.items()}

def rest_val_to_dict(v):
    if "stringValue" in v: return v["stringValue"]
    if "integerValue" in v: return int(v["integerValue"])
    if "doubleValue" in v: return float(v["doubleValue"])
    if "booleanValue" in v: return v["booleanValue"]
    if "arrayValue" in v: return [rest_val_to_dict(x) for x in v["arrayValue"].get("values", [])]
    if "mapValue" in v: return rest_to_dict(v["mapValue"].get("fields", {}))
    if "nullValue" in v: return None
    return None

def rest_to_dict(fields):
    return {k: rest_val_to_dict(v) for k, v in fields.items()}

# Insert
doc_id = str(uuid.uuid4())
data = {"name": "Test User", "age": 30, "active": True, "tags": ["a", "b"], "meta": {"foo": "bar"}}
url = f"{base_url}/users/{doc_id}"
res = requests.patch(url, headers={"Authorization": f"Bearer {token}"}, json={"fields": dict_to_rest(data)})
print("Insert:", res.status_code)

# Get
res = requests.get(url, headers={"Authorization": f"Bearer {token}"}).json()
print("Get:", rest_to_dict(res.get("fields", {})))
