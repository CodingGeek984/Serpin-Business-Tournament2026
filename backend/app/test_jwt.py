import os, json, requests, jwt
from email.utils import parsedate_to_datetime

os.environ["FIREBASE_SERVICE_ACCOUNT"] = "/home/danik/Serpin-Business-Tournament2026/backend/app/serpin-business-tournament2026-699aac43ca43.json"
os.environ["FIREBASE_PROJECT_ID"] = "serpin-business-tournament2026"

# 1. Fetch real current time from Google
time_res = requests.head("https://oauth2.googleapis.com/token")
date_str = time_res.headers.get("Date")
real_now = int(parsedate_to_datetime(date_str).timestamp())

with open(os.environ["FIREBASE_SERVICE_ACCOUNT"]) as f:
    sa = json.load(f)

payload = {
    "iss": sa["client_email"],
    "sub": sa["client_email"],
    "aud": "https://oauth2.googleapis.com/token",
    "iat": real_now,
    "exp": real_now + 3600,
    "scope": "https://www.googleapis.com/auth/datastore"
}

encoded_jwt = jwt.encode(payload, sa["private_key"], algorithm="RS256")

res = requests.post("https://oauth2.googleapis.com/token", data={
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "assertion": encoded_jwt
})
print("Token res:", res.status_code, res.text[:200])
token = res.json().get("access_token")

if token:
    db_url = f"https://firestore.googleapis.com/v1/projects/{os.environ['FIREBASE_PROJECT_ID']}/databases/(default)/documents/users"
    res = requests.get(db_url, headers={"Authorization": f"Bearer {token}"})
    print("Firestore:", res.status_code, res.text[:200])
