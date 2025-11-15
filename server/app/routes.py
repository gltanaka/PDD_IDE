"""
API route handlers
"""

import os
import tempfile
import logging
from fastapi import APIRouter, HTTPException

from app.models import (
    Response,
    PDDCommandRequest,
    PDDCommandInfo,
    CommandsResponse,
    FileRequest,
    FileResponse
)
from app.services import execute_pdd_command, get_pdd_commands_info

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.get("/api")
async def root():
    """Health check endpoint."""
    return {"message": "PDD Backend API is running", "version": "1.0.0"}


@router.get("/commands", response_model=CommandsResponse)
async def get_commands():
    """
    Get all available PDD commands with their descriptions.
    
    This endpoint returns all stored CLI commands that can be executed via /execute.
    All CLI commands are stored here and can be retrieved by the frontend.
    
    Returns:
        CommandsResponse with list of all available PDD commands
    """
    commands_info = get_pdd_commands_info()
    return CommandsResponse(
        commands=commands_info,
        total=len(commands_info)
    )


@router.post("/execute", response_model=Response)
async def execute_command(request: PDDCommandRequest):
    """
    Universal endpoint to execute any PDD CLI command.
    
    This endpoint stores all CLI commands and executes them based on user requests.
    The frontend can call this endpoint with any CLI command name from /commands.
    
    All CLI commands are stored in the backend and can be executed through this single endpoint:
    - generate: Creates runnable code from a prompt
    - sync: Executes the complete PDD workflow loop
    - test, fix, verify, etc.: All other PDD commands
    
    Args:
        request: PDDCommandRequest containing:
            - command: CLI command name (e.g., "generate", "sync", "test")
            - prompt: Optional prompt content for commands that need it
            - basename: Optional basename for commands that need it
            - args: Optional additional command arguments as key-value pairs
        
    Returns:
        Response with YAML formatted output as string
    """
    # Validate that the command exists in our stored commands
    available_commands = get_pdd_commands_info()
    command_names = [cmd.name for cmd in available_commands]
    
    if request.command not in command_names:
        return Response(
            output="",
            success=False,
            error=f"Unknown command: {request.command}. Available commands: {', '.join(command_names)}"
        )
    
    # Build the pdd command
    command = ["pdd", request.command]
    
    # Handle prompt file if prompt is provided
    # Note: pdd generate expects PROMPT_FILE as a positional argument, not -p option
    # Frontend may pass either a file path (e.g., "prompts/common/react-setup.prompt") 
    # or file content. We need to handle both cases.
    prompt_file = None
    should_cleanup_temp_file = False
    if request.prompt:
        try:
            server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            # Check if prompt is a file path (contains '/' or ends with '.prompt')
            # If it looks like a path, try to resolve it relative to server directory
            if '/' in request.prompt or request.prompt.endswith('.prompt'):
                # Treat as file path - resolve relative to server directory
                potential_file_path = os.path.join(server_dir, request.prompt.lstrip('/'))
                
                if os.path.exists(potential_file_path) and os.path.isfile(potential_file_path):
                    # File exists, use it directly
                    prompt_file = potential_file_path
                    logger.info(f"Using existing prompt file: {prompt_file}")
                else:
                    # File doesn't exist, return error
                    logger.error(f"Prompt file not found: {potential_file_path}")
                    return Response(
                        output="",
                        success=False,
                        error=f"Prompt file not found: {request.prompt}. Please ensure the file exists in the server directory."
                    )
            else:
                # Treat as file content - create temporary file
                # PRD and graph files are determined automatically
                with tempfile.NamedTemporaryFile(mode='w', suffix='.prompt', delete=False) as tmp_file:
                    tmp_file.write(request.prompt)
                    prompt_file = tmp_file.name
                    should_cleanup_temp_file = True
                logger.info(f"Created temporary prompt file: {prompt_file}")
                
                # Set default PRD file if not provided in args
                # PRD and graph files are determined automatically on the backend
                if request.args is None:
                    request.args = {}
                # Set default PRD file path if not already specified
                has_prd_env = False
                if "-e" in request.args:
                    if isinstance(request.args["-e"], list):
                        has_prd_env = any("PRD_FILE" in str(item) for item in request.args["-e"])
                    else:
                        has_prd_env = "PRD_FILE" in str(request.args["-e"])
                if "--env-file" in request.args:
                    if isinstance(request.args["--env-file"], list):
                        has_prd_env = any("PRD_FILE" in str(item) for item in request.args["--env-file"])
                    else:
                        has_prd_env = "PRD_FILE" in str(request.args["--env-file"])
                
                if not has_prd_env:
                    # Add PRD_FILE environment variable pointing to default PRD
                    server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    default_prd = os.path.join(server_dir, "docs", "specs.md")
                    if os.path.exists(default_prd):
                        if "-e" in request.args:
                            if isinstance(request.args["-e"], list):
                                request.args["-e"].append("PRD_FILE=docs/specs.md")
                            else:
                                request.args["-e"] = [request.args["-e"], "PRD_FILE=docs/specs.md"]
                        else:
                            request.args["-e"] = "PRD_FILE=docs/specs.md"
                        logger.info("Using default PRD file: docs/specs.md")
            
            # For generate command, prompt file is a positional argument
            if request.command == "generate":
                command.append(prompt_file)  # Add as positional argument
            else:
                # For other commands, check if they need prompt file differently
                command.append(prompt_file)
        except Exception as e:
            logger.error(f"Error handling prompt file: {str(e)}")
            return Response(
                output="",
                success=False,
                error=f"Failed to handle prompt file: {str(e)}"
            )
    
    # Handle basename if provided
    if request.basename:
        command.extend(["-b", request.basename])
    
    # Handle additional arguments
    if request.args:
        for key, value in request.args.items():
            if key.startswith("-"):
                # Handle repeated flags (e.g., multiple -e flags)
                if isinstance(value, list):
                    # If value is a list, add the flag multiple times
                    for item in value:
                        command.append(key)
                        if item:  # Only add value if it's not empty/None
                            command.append(str(item))
                elif value is None:
                    # Flag without value (e.g., --force)
                    command.append(key)
                else:
                    # Single value
                    command.append(key)
                    if value:  # Only add value if it's not empty/None
                        command.append(str(value))
            else:
                # If key doesn't start with -, add it as -key
                command.append(f"-{key}")
                if isinstance(value, list):
                    # Handle list values
                    for item in value:
                        if item:
                            command.append(str(item))
                elif value is not None:
                    command.append(str(value))
    
    try:
        # Execute the command
        output, success, error = execute_pdd_command(command, f"PDD {request.command}")
        
        # Clean up temporary file if created (only if it was a temp file, not an existing file)
        if prompt_file and should_cleanup_temp_file and os.path.exists(prompt_file):
            try:
                os.unlink(prompt_file)
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {prompt_file}: {str(e)}")
        
        if not success:
            # Check if pdd command is not found
            if "No such file or directory" in (error or "") or "not found" in (error or "").lower():
                return Response(
                    output="",
                    success=False,
                    error=f"PDD CLI tool not found. Please ensure 'pdd' is installed and available in PATH. Original error: {error}"
                )
            
            return Response(
                output="",
                success=False,
                error=error or f"{request.command} command failed"
            )
        
        # Return the output as YAML string
        return Response(
            output=output,
            success=True,
            error=None
        )
        
    except Exception as e:
        # Clean up temporary file if created (only if it was a temp file, not an existing file)
        if prompt_file and should_cleanup_temp_file and os.path.exists(prompt_file):
            try:
                os.unlink(prompt_file)
            except Exception:
                pass
        
        logger.error(f"Unexpected error executing command {request.command}: {str(e)}")
        return Response(
            output="",
            success=False,
            error=f"Internal server error: {str(e)}"
        )


@router.post("/files", response_model=Response)
async def save_file(request: FileRequest):
    """
    Save file content to the server.
    
    Args:
        request: FileRequest containing:
            - path: File path relative to server directory
            - content: File content to save
        
    Returns:
        Response indicating success or failure
    """
    try:
        server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(server_dir, request.path.lstrip('/'))
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Write the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(request.content)
        
        logger.info(f"File saved: {file_path}")
        return Response(
            output=f"File saved successfully: {request.path}",
            success=True,
            error=None
        )
    except Exception as e:
        logger.error(f"Error saving file {request.path}: {str(e)}")
        return Response(
            output="",
            success=False,
            error=f"Failed to save file: {str(e)}"
        )


@router.get("/files", response_model=FileResponse)
async def get_file(path: str):
    """
    Get file content from the server.
    
    Args:
        path: File path relative to server directory (query parameter)
        
    Returns:
        FileResponse with file content
    """
    try:
        server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(server_dir, path.lstrip('/'))
        
        if not os.path.exists(file_path):
            return FileResponse(
                content="",
                success=False,
                error=f"File not found: {path}"
            )
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return FileResponse(
            content=content,
            success=True,
            error=None
        )
    except Exception as e:
        logger.error(f"Error reading file {path}: {str(e)}")
        return FileResponse(
            content="",
            success=False,
            error=f"Failed to read file: {str(e)}"
        )

