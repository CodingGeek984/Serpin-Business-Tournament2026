import os
from dotenv import load_dotenv
load_dotenv('.env')
from app.store import create_store
store = create_store()
try:
    print(store.first("users", email="test@test.com"))
except Exception as e:
    print("ERROR:", type(e), e)
