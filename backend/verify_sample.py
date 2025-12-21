from gemini_client import process_document, configure_gemini
import os

def check_sample():
    print("--- Verifying 'sample.pdf' ---")
    file_path = "sample.pdf"
    
    if not os.path.exists(file_path):
        print(f"[ERROR] File {file_path} not found!")
        return

    import time
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            configure_gemini()
            # MIME type for PDF
            result = process_document(file_path, "application/pdf")
            
            print("\n[SUCCESS] Document Processed.")
            print("--- Extracted Content Preview ---")
            print(result[:500]) # Print first 500 chars
            print("-------------------------------")
            return
            
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                print(f"[Warn] Rate limit hit. Retrying in 10s...")
                time.sleep(10)
            else:
                print(f"[FAILED] Processing failed: {e}")
                return

if __name__ == "__main__":
    check_sample()
