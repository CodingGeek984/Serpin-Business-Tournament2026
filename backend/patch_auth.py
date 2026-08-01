import datetime
import google.auth.jwt

original_encode = google.auth.jwt.encode

def patched_encode(signer, payload, key_id=None):
    if "iat" in payload:
        payload["iat"] = int(datetime.datetime.now().timestamp()) - 365 * 2 * 24 * 3600
    if "exp" in payload:
        payload["exp"] = payload["iat"] + 3600
    return original_encode(signer, payload, key_id)

google.auth.jwt.encode = patched_encode

import firebase_admin
from firebase_admin import credentials, firestore
import os

from dotenv import load_dotenv
load_dotenv('.env')

try:
    cred = credentials.Certificate(os.environ.get('FIREBASE_SERVICE_ACCOUNT'))
    firebase_admin.initialize_app(cred, {'projectId': os.environ.get('FIREBASE_PROJECT_ID')})
    db = firestore.client()
    print(list(db.collection('tools').limit(1).stream()))
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
