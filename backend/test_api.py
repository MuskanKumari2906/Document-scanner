import requests
import os
import shutil
import time
from multiprocessing import Process
import uvicorn
import shutil

# We need the server running to test it. 
# In a real CI/CD, we'd use TestClient, but here we want to test the full stack startup.
# However, TestClient is easier/faster for this agent environment.
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_upload_endpoint():
    print("--- Testing /upload Endpoint ---")
    
    dummy_filename = "test_upload.txt"
    with open(dummy_filename, "w") as f:
        f.write("This is a test file for upload.")
        
    try:
        with open(dummy_filename, "rb") as f:
            response = client.post("/upload", files={"file": (dummy_filename, f, "text/plain")})
            
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and "path" in response.json():
            print("[SUCCESS] File uploaded successfully.")
        else:
            print(f"[FAILED] Upload failed. {response.text}")
            
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        if os.path.exists(dummy_filename):
            os.remove(dummy_filename)
        # Clean up upload dir
        if os.path.exists("uploads/test_upload.txt"):
            os.remove("uploads/test_upload.txt")

if __name__ == "__main__":
    test_upload_endpoint()
