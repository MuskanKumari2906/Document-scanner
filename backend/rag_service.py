import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict
import os
from gemini_client import embed_text, configure_gemini

# --- Configuration ---
PERSIST_DIRECTORY = "db_storage"

class RAGService:
    def __init__(self):
        """
        Initializes the ChromaDB client and collection.
        Uses a local persistent storage.
        """
        print("Initializing RAG Service...")
        configure_gemini() # Ensure API is set up
        self.client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        
        # Create or Get a collection
        # We don't use a built-in embedding function because we use Gemini manually
        self.collection = self.client.get_or_create_collection(
            name="legal_knowledge_base",
            metadata={"hnsw:space": "cosine"} # Cosine similarity for semantic search
        )
        print(f"RAG Service Initialized. Collection count: {self.collection.count()}")

    def add_documents(self, documents: List[str], metadatas: List[Dict], ids: List[str]):
        """
        Adds documents to the knowledge base.
        """
        print(f"Adding {len(documents)} documents to Knowledge Base...")
        
        # 1. Generate Embeddings using Gemini
        embeddings = [embed_text(doc) for doc in documents]
        
        # 2. Add to Chroma
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print("Documents added successfully.")

    def query(self, query_text: str, n_results: int = 3) -> List[str]:
        """
        Retrieves relevant context for a query.
        """
        print(f"Querying RAG for: '{query_text}'")
        
        # 1. Embed query
        query_embedding = embed_text(query_text)
        
        # 2. Query Chroma
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Simplify output
        documents = results['documents'][0]
        return documents

# Singleton Instance (optional, or created on startup)
rag_service = RAGService()
