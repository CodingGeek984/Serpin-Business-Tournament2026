import os, json, requests
from email.utils import parsedate_to_datetime
from freezegun import freeze_time

os.environ["FIREBASE_SERVICE_ACCOUNT"] = "/home/danik/Serpin-Business-Tournament2026/backend/app/serpin-business-tournament2026-699aac43ca43.json"
os.environ["FIREBASE_PROJECT_ID"] = "serpin-business-tournament2026"

# 1. Fetch token
res = requests.head("https://oauth2.googleapis.com/token")
real_time = parsedate_to_datetime(res.headers["Date"]).replace(tzinfo=None)

with freeze_time(real_time):
    import google.auth.transport.requests
    from google.oauth2 import service_account
    creds = service_account.Credentials.from_service_account_file(
        os.environ["FIREBASE_SERVICE_ACCOUNT"],
        scopes=['https://www.googleapis.com/auth/datastore']
    )
    request = google.auth.transport.requests.Request()
    creds.refresh(request)
    my_token = creds.token
    print("Fetched token")

# 2. Inject token into firebase_admin
import google.auth.credentials
class MyCredentials(google.auth.credentials.Credentials):
    def __init__(self, token):
        self.token = token
    def refresh(self, request):
        pass

from firebase_admin import credentials as fb_creds, firestore, initialize_app
import firebase_admin

# Firebase admin expects a google.auth.credentials.Credentials wrapped in its own Certificate?
# Actually, initialize_app accepts a Custom credential?
# Or we can just set the internal credentials of the Certificate.
cert = fb_creds.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT"])
cert.get_credential = lambda: MyCredentials(my_token)

initialize_app(cert, {"projectId": os.environ["FIREBASE_PROJECT_ID"]})

db = firestore.client()
print("Client initialized. Fetching users...")
users = list(db.collection("users").limit(1).stream())
print("Users:", users)
