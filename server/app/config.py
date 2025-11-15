"""
Configuration settings for the PDD Backend Server
"""

import os
from typing import List, Optional

# Server Configuration
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# CORS Configuration
CORS_ORIGINS: List[str] = os.getenv(
    "CORS_ORIGINS", 
    "*"
).split(",") if os.getenv("CORS_ORIGINS") != "*" else ["*"]

# PDD Command Configuration
PDD_COMMAND_TIMEOUT: int = int(os.getenv("PDD_COMMAND_TIMEOUT", "300"))  # 5 minutes

# Logging Configuration
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

# PDD API Keys (passed to pdd commands via environment)
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")

