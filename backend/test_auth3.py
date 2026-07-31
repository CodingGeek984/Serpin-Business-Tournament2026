import datetime
import google.auth._helpers
def mock_utcnow():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=365 * 2 + 50)
google.auth._helpers.utcnow = mock_utcnow

import os
from dotenv import load_dotenv
load_dotenv('.env')

from app.store import create_store
store = create_store()
print(list(store.db.collection('tools').limit(1).stream()))
print("SUCCESS")
