from rag_service import rag_service

def initialize_knowledge_base():
    """
    Seeds the ChromaDB with sample legal and government scheme data.
    """
    print("--- Seeding Knowledge Base ---")
    
    documents = [
        # Electricity Context
        "The Electricity Act, 2003: Section 126 provides for assessment of unauthorized use of electricity. If unauthorized use is detected, the consumer is liable to pay for the energy at a rate equal to twice the tariff applicable.",
        "The Electricity Act, 2003: Section 135 deals with theft of electricity (tapping lines, tampering meters). It is a punishable offense with imprisonment up to 3 years or fine.",
        "Electricity Bill Due Date: Usually, the due date is 15 days from the bill generation. Late payment attracts a surcharge of 1.5% per month.",
        
        # General Legal/Notices
        "Legal Notice Response: If you receive a legal notice, you must reply within the stipulated time (usually 15-30 days) denying false allegations, otherwise facts may be deemed admitted.",
        "Cheque Bounce (Section 138 NI Act): It is a criminal offense if a cheque is dishonored for insufficient funds. Punishment includes imprisonment up to 2 years or twice the cheque amount.",
        
        # Common Schemes
        "PM Vishwakarma Scheme: Provides collateral-free loans up to Rs 3 lakh at 5% interest for artisans and craftspeople.",
        "Ayushman Bharat: Provides health cover of Rs 5 lakh per family per year for secondary and tertiary care hospitalization."
    ]
    
    metadatas = [
        # Metadata follows the order of documents
        {"source": "Electricity Act", "topic": "Unauthorized Use"},
        {"source": "Electricity Act", "topic": "Theft"},
        {"source": "General Utility", "topic": "Billing"},
        {"source": "Legal Procedure", "topic": "Notice"},
        {"source": "NI Act", "topic": "Cheque Bounce"},
        {"source": "Govt Scheme", "topic": "Loan"},
        {"source": "Govt Scheme", "topic": "Health"}
    ]
    
    # Simple IDs
    ids = [f"seed_doc_{i}" for i in range(len(documents))]
    
    try:
        # Check if already exists to avoid duplication errors (simplified check)
        existing_count = rag_service.collection.count()
        if existing_count > 0:
             print(f"Knowledge Base already has {existing_count} documents. Skipping seed for safety.")
             # In a real app, we might check IDs or use upsert.
             # For this task, we can force add if needed, but let's be safe.
             return

        rag_service.add_documents(documents, metadatas, ids)
        print("[SUCCESS] Seeding Complete.")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ERROR] Seeding failed: {e}")

if __name__ == "__main__":
    initialize_knowledge_base()
