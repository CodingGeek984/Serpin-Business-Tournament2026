import os
from dotenv import load_dotenv
load_dotenv()
try:
    from app.store import create_store
    store = create_store()
    print("SUCCESS: Database initialized!")
    print(store.all("tools")[:1])
except Exception as e:
    print("ERROR:", e)
