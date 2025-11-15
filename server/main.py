"""
Entry point for running the PDD Backend Server
This file allows running the server directly: python main.py
"""

from app.main import app
import uvicorn
from app.config import HOST, PORT

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)

