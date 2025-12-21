from fastapi.testclient import TestClient
from main import app
import os
import time

client = TestClient(app)

def test_full_flow():
    print("--- Testing Full Analysis Flow (Upload + RAG + Vision) ---")
    
    filename = "sample.pdf"
    if not os.path.exists(filename):
        # Fallback to creating a dummy if sample is missing, but user said they uploaded it.
        print(f"[ERROR] {filename} not found in root. Please ensure it exists.")
        return

    # 1. Upload
    print(f"Step 1: Uploading {filename}...")
    with open(filename, "rb") as f:
        response = client.post("/upload", files={"file": (filename, f, "application/pdf")})
    
    if response.status_code != 200:
        print(f"[FAILED] Upload failed: {response.text}")
        return
    print("[SUCCESS] Uploaded.")

    # 2. Analyze
    target_lang = "Hindi"
    print(f"Step 2: Requesting Analysis in '{target_lang}'...")
    
    payload = {"filename": filename, "language": target_lang}
    
    start_time = time.time()
    try:
        response = client.post("/analyze", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n[SUCCESS] Analysis Complete in {duration:.2f}s")
            
            print("\n--- AI Explanation ---")
            print(data["explanation"])
            
            print("\n--- Context Used (RAG) ---")
            print(data["related_laws"])
        else:
             print(f"\n[FAILED] Analysis failed: {response.status_code}")
             print(response.text)
             
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")

if __name__ == "__main__":
    test_full_flow()
