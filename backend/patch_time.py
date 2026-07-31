import time
import datetime

# Fix time for google.auth
class MockDatetime(datetime.datetime):
    @classmethod
    def utcnow(cls):
        # Subtract 2 years
        return super().utcnow() - datetime.timedelta(days=365 * 2)

datetime.datetime = MockDatetime

import google.auth.jwt
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
