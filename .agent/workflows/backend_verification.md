---
description: Run manual backend verification
---

This workflow helps you manually verify the document scanner backend and generate explanations in different languages.

1. Ensure you are in the project root.
2. Run the manual verification script:

```powershell
.\venv\Scripts\python backend/manual_check.py
```

3. Follow the on-screen prompts:
   - Enter your desired language (e.g., Hindi, Spanish, Marathi).
   - The script will upload `sample.pdf`, run the analysis, and print the result.
