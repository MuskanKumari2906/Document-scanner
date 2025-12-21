import os
import time
import google.generativeai as genai
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()


# --- Configuration ---
def configure_gemini(api_key: Optional[str] = None):
    """
    Configures the Gemini API.
    Attempts to use the passed key, or looks for GEMINI_API_KEY in environment.
    """
    key_to_use = api_key or os.environ.get("GEMINI_API_KEY")
    if not key_to_use:
        raise ValueError("Google Gemini API Key is missing. Please set GEMINI_API_KEY.")
    
    genai.configure(api_key=key_to_use)
    print("Gemini API Configured successfully.")

# --- Helper: File Processing ---
def _wait_for_file_active(file_obj):
    """Waits for the uploaded file to be processed by Google's servers."""
    print(f"Waiting for file {file_obj.name} to be processed...", end="", flush=True)
    while file_obj.state.name == "PROCESSING":
        print(".", end="", flush=True)
        time.sleep(1)
        file_obj = genai.get_file(file_obj.name)
    print("Done")
    
    if file_obj.state.name != "ACTIVE":
        raise Exception(f"File {file_obj.name} failed to process. State: {file_obj.state.name}")
    return file_obj

# --- Core Functions ---

def process_document(file_path: str, mime_type: str) -> str:
    """
    Uploads a document (PDF/Image) to Gemini and extracts text concepts.
    Uses Gemini 1.5 Flash for speed and multimodal capabilities.
    """
    print(f"Uploading {file_path} to Gemini...")
    uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
    
    # Ensure file is ready
    uploaded_file = _wait_for_file_active(uploaded_file)
    
    # Vision/Multimodal Model
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = """
    Analyze this document. 
    1. Extract all legible text from it verbatim.
    2. If there are tables or specific layout elements, describe them briefly.
    3. Identify the type of document (e.g., Electricity Bill, Court Notice).
    """
    
    response = model.generate_content([uploaded_file, prompt])
    return response.text

def embed_text(text: str) -> List[float]:
    """
    Generates an embedding vector for the given text using text-embedding-004.
    Includes retry logic for rate limits.
    """
    max_retries = 5
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                wait_time = base_delay * (2 ** attempt)
                print(f"[Warn] Rate limit hit. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e
    raise Exception("Max retries exceeded for embedding.")

def generate_explanation(doc_text: str, retrieved_context: str, language: str) -> str:
    """
    Generates the final simplified explanation in the target local language.
    Combines the Document Text with Retrieved Laws.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = f"""
    You are a helpful assistant for citizens who struggle to understand official documents.
    
    TARGET LANGUAGE: {language}
    
    --- DOCUMENT CONTENT ---
    {doc_text}
    
    --- RELEVANT KNOWLEDGE (Laws/Schemes) ---
    {retrieved_context}
    
    --- INSTRUCTIONS ---
    1. Explain carefully what this document is.
    2. Simplify any legal/technical jargon using the Relevant Knowledge provided.
    3. Tell the user clearly what ACTION they need to take (Deadlines, Payment Amounts, etc.).
    4. Provide the final response completely in {language}.
    5. Use Markdown formatting (bolding important dates/amounts).
    """
    
    response = model.generate_content(prompt)
    return response.text
