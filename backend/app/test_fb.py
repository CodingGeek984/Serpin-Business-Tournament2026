import os
from freezegun import freeze_time

with freeze_time("2024-08-01 12:00:00"):
    from firebase_admin import credentials, firestore, initialize_app

    os.environ["FIREBASE_SERVICE_ACCOUNT"] = "/home/danik/Serpin-Business-Tournament2026/backend/app/serpin-business-tournament2026-699aac43ca43.json"
    os.environ["FIREBASE_PROJECT_ID"] = "serpin-business-tournament2026"

    credential = credentials.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    initialize_app(credential, {"projectId": os.environ["FIREBASE_PROJECT_ID"]})

    db = firestore.client()
    print("Connected. Fetching users...")
    try:
        users = list(db.collection("users").limit(1).stream())
        print("Users:", users)
    except Exception as e:
        print("Error:", e)
