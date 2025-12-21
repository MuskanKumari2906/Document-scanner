from rag_service import rag_service
import os

print("Checking for persistent storage...")
if os.path.exists("backend/db_storage") or os.path.exists("db_storage"):
    print("[SUCCESS] 'db_storage' directory found. ChromaDB is persistent.")
    print(f"Current collection count: {rag_service.collection.count()}")
else:
    print("[NOTE] 'db_storage' not found yet. It should be created in the current working directory.")
