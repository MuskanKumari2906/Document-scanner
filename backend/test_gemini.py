from gemini_client import configure_gemini, embed_text, process_document
import os

def test_connection():
    print("--- Starting Gemini Connection Test ---")
    try:
        configure_gemini()
        print("[OK] Auth Configured.")
        
        # Test 1: Embedding (Simple API call)
        print("Testing Embedding...", end=" ")
        vector = embed_text("Hello World")
        if len(vector) > 0:
            print(f"[OK] Vector generated (dim: {len(vector)})")
        
        # Test 2: File Upload (Using text file for simplicity)
        print("Testing File Upload & Processing...", end=" ")
        dummy_filename = "test_doc.txt"
        with open(dummy_filename, "w") as f:
            f.write("This is a legally binding test document. Penalty for failure is 500 rupees.")
            
        # We pass text/plain. Gemini handles it.
        result = process_document(dummy_filename, "text/plain")
        print(f"[OK] Processed.")
        print(f"Preview: {result[:100].strip()}...")
        
        # Cleanup
        if os.path.exists(dummy_filename):
            os.remove(dummy_filename)
        
        print("\n--- ALL TESTS PASSED ---")
        
    except Exception as e:
        print(f"\n[FAILED] Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
