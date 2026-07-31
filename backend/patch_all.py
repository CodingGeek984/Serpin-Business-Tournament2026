import time
import datetime
class MockDatetime(datetime.datetime):
    @classmethod
    def utcnow(cls):
        return super().utcnow() - datetime.timedelta(days=365 * 2 + 50)
    @classmethod
    def now(cls, tz=None):
        return super().now(tz) - datetime.timedelta(days=365 * 2 + 50)
datetime.datetime = MockDatetime

original_time = time.time
def mock_time():
    return original_time() - (365 * 2 + 50) * 24 * 3600
time.time = mock_time

import google.auth._helpers
google.auth._helpers.utcnow = MockDatetime.utcnow

import os
from dotenv import load_dotenv
load_dotenv('.env')

from app.store import create_store
store = create_store()
print(list(store.db.collection('tools').limit(1).stream()))
print("SUCCESS")
