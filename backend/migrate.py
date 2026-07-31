import json
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv('.env')

with open('app/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
if not cred_path:
    print("No FIREBASE_SERVICE_ACCOUNT found in .env")
    exit(1)

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred, {'projectId': os.environ.get('FIREBASE_PROJECT_ID')})
db = firestore.client()

for collection_name, items in data.items():
    print(f"Migrating {collection_name} ({len(items)} items)...")
    for item in items:
        # We need to keep the 'id' field inside the document as well since store.py expects it? 
        # Actually store.py FirestoreStore says `return {"id": snapshot.id, **snapshot.to_dict()}`
        # So we can remove it or keep it. Let's keep it to be safe, or remove it and use it as doc ID.
        item_id = item.get('id')
        if not item_id:
            continue
        # Also remove 'id' from item to avoid duplication if we want, but keeping it is fine
        doc_ref = db.collection(collection_name).document(item_id)
        # only set if it doesn't exist? let's overwrite to make sure we have all templates
        doc_ref.set(item)

print("Migration completed successfully!")
