"""
Pydantic models for request and response validation
"""

from pydantic import BaseModel
from typing import Optional, List


class Response(BaseModel):
    """Response model for API endpoints."""
    output: str  # YAML formatted output as string
    success: bool  # Whether the operation was successful
    error: Optional[str] = None  # Error message if operation failed


class PDDCommandRequest(BaseModel):
    """Request model for executing any pdd command."""
    command: str  # The pdd command name (e.g., "generate", "sync", "test")
    args: Optional[dict] = None  # Optional command arguments as key-value pairs
    # For repeated flags like -e, use array format: {"-e": ["VAR1=value1", "VAR2=value2"]}
    prompt: Optional[str] = None  # Optional prompt content for commands that need it
    basename: Optional[str] = None  # Optional basename for commands that need it


class PDDCommandInfo(BaseModel):
    """Information about a PDD command."""
    name: str
    description: str
    usage: str


class CommandsResponse(BaseModel):
    """Response model for listing all available commands."""
    commands: List[PDDCommandInfo]
    total: int


class FileRequest(BaseModel):
    """Request model for file operations."""
    path: str
    content: str


class FileResponse(BaseModel):
    """Response model for file operations."""
    content: str
    success: bool
    error: Optional[str] = None

