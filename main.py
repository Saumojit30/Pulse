import sys
from pathlib import Path

# Ensure src directory is in sys.path
sys.path.insert(0, str(Path(__file__).parent / "src"))

import uvicorn

if __name__ == "__main__":
    print("Starting Pulse Autonomous GTM Intelligence System on port 8001...")
    uvicorn.run("gtm_intelligence.api.server:app", host="127.0.0.1", port=8001, log_level="info")
