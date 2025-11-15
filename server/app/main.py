"""
PDD Backend Server - Main Application Entry Point
A FastAPI backend that wraps the pdd (Prompt Driven Development) CLI tool.
"""

import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, LOG_LEVEL
from app.routes import router

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PDD Backend API",
    description="Backend API for Prompt Driven Development (PDD) tool",
    version="1.0.0"
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (API routes must be included before static files)
app.include_router(router)

# Serve static files (frontend) - must be after API routes
# Get the project root directory (parent of server directory)
server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(server_dir)
frontend_dist = os.path.join(project_root, "dist")

# Only mount static files if dist directory exists
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
    logger.info(f"Serving frontend from: {frontend_dist}")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist}. Frontend will not be served.")


@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("PDD Backend API starting up...")
    logger.info(f"CORS origins: {CORS_ORIGINS}")


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown information."""
    logger.info("PDD Backend API shutting down...")


if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    
    # Run the server
    logger.info(f"Starting server on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)

