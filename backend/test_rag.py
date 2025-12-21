from rag_service import rag_service

def test_rag_retrieval():
    print("--- Testing RAG Retrieval ---")
    
    # query = "What is the penalty for stealing electricity?"
    query = "theft of electricity penalty"
    
    print(f"Query: {query}")
    results = rag_service.query(query, n_results=2)
    
    print("\nResults:")
    for i, doc in enumerate(results):
        print(f"{i+1}. {doc}")
        
    # Check if we got the right document
    found = any("Section 135" in doc for doc in results)
    
    if found:
        print("\n[SUCCESS] Retrieved relevant 'Section 135' document.")
    else:
        print("\n[FAILED] Could not find relevant document.")

if __name__ == "__main__":
    test_rag_retrieval()
