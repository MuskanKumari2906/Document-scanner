from fastapi.testclient import TestClient
from main import app
import os
import time

client = TestClient(app)

def manual_verification():
    print("\n===========================================")
    print("   Document Scanner Backend Verification   ")
    print("===========================================")
    
    filename = "sample.pdf"
    if not os.path.exists(filename):
        print(f"[ERROR] '{filename}' not found in the current directory.")
        print("Please ensure 'sample.pdf' exists in 'backend/' or the root.")
        return

    # 1. Ask for Language
    target_lang = input("\nEnter target language (e.g., Hindi, Tamil, French) [default: Hindi]: ").strip()
    if not target_lang:
        target_lang = "Hindi"

    print(f"\n[INFO] Starting process for language: {target_lang}")

    # 2. Upload
    print(f"\nStep 1: Uploading {filename}...")
    try:
        with open(filename, "rb") as f:
            response = client.post("/upload", files={"file": (filename, f, "application/pdf")})
        
        if response.status_code != 200:
            print(f"[FAILED] Upload failed: {response.text}")
            return
        print("[SUCCESS] Uploaded.")
    except Exception as e:
        print(f"[ERROR] Upload Exception: {e}")
        return

    # 3. Analyze
    print(f"Step 2: Analyzing & Explaining in {target_lang}...")
    
    payload = {"filename": filename, "language": target_lang}
    
    start_time = time.time()
    try:
        response = client.post("/analyze", json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n[SUCCESS] Analysis Complete in {duration:.2f}s")
            
            print("\n" + "="*40)
            print(f" AI EXPLANATION ({target_lang}) ")
            print("="*40)
            print(data["explanation"])
            print("\n" + "="*40)
            
            print("\n--- Relevant Laws/Context (RAG) ---")
            for item in data.get("related_laws", []):
                print(f"- {item}")
        else:
             print(f"\n[FAILED] Anaylsis failed with status {response.status_code}")
             print(f"Response: {response.text}")
             
    except Exception as e:
        print(f"[ERROR] Analysis Exception: {e}")

if __name__ == "__main__":
    manual_verification()
    input("\nPress Enter to exit...")
