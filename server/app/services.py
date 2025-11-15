"""
Service layer for executing PDD commands
"""

import subprocess
import logging
import os
from typing import Tuple, Optional, List
from app.models import PDDCommandInfo

from app.config import PDD_COMMAND_TIMEOUT

logger = logging.getLogger(__name__)


def execute_pdd_command(command: List[str], description: str, working_dir: Optional[str] = None) -> Tuple[str, bool, Optional[str]]:
    """
    Execute a pdd command and return the output.
    
    Args:
        command: List of command arguments (e.g., ['pdd', 'generate', '-p', 'prompt.txt'])
        description: Description of the command for logging
        
    Returns:
        Tuple of (output, success, error_message)
    """
    try:
        logger.info(f"Executing: {' '.join(command)}")
        
        # Try to find pdd in common locations
        # First, try to use pdd from a venv_pdd directory relative to the server
        server_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        venv_pdd_path = os.path.join(server_dir, "venv_pdd", "bin", "pdd")
        
        # If venv_pdd doesn't exist, try parent directory (for cases where server is in a subdirectory)
        if not os.path.exists(venv_pdd_path):
            parent_dir = os.path.dirname(server_dir)
            venv_pdd_path = os.path.join(parent_dir, "venv_pdd", "bin", "pdd")
        
        # Try Desktop/pdd_server location (original location)
        if not os.path.exists(venv_pdd_path):
            desktop_pdd_path = os.path.join(os.path.expanduser("~"), "Desktop", "pdd_server", "venv_pdd", "bin", "pdd")
            if os.path.exists(desktop_pdd_path):
                venv_pdd_path = desktop_pdd_path
        
        # If venv_pdd still doesn't exist, try system pdd or use environment variable
        if os.path.exists(venv_pdd_path):
            # Replace 'pdd' with full path if it's the first argument
            if command[0] == "pdd":
                command[0] = venv_pdd_path
                logger.info(f"Using pdd from: {venv_pdd_path}")
        else:
            # Try to use pdd from PATH or PDD_PATH environment variable
            pdd_path = os.getenv("PDD_PATH", "pdd")
            if command[0] == "pdd" and pdd_path != "pdd":
                command[0] = pdd_path
                logger.info(f"Using pdd from PDD_PATH: {pdd_path}")
            else:
                # Last resort: try to find pdd in common system locations
                import shutil
                pdd_system_path = shutil.which("pdd")
                if pdd_system_path:
                    command[0] = pdd_system_path
                    logger.info(f"Using pdd from system PATH: {pdd_system_path}")
                else:
                    logger.error("pdd command not found in any location")
                    logger.error(f"Checked: {venv_pdd_path}, {desktop_pdd_path if 'desktop_pdd_path' in locals() else 'N/A'}, PATH")
        
        # Prepare environment with API keys from server environment
        env = os.environ.copy()
        # Only use Gemini API key (as requested)
        from app.config import GEMINI_API_KEY
        if GEMINI_API_KEY:
            env["GEMINI_API_KEY"] = GEMINI_API_KEY
            # Clear other API keys to ensure only Gemini is used
            env.pop("OPENAI_API_KEY", None)
            env.pop("ANTHROPIC_API_KEY", None)
        
        # Set working directory to server directory so pdd uses correct project root
        if working_dir is None:
            working_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Add --yes flag only for commands that support it and might prompt for confirmation
        # Note: Not all pdd commands support --yes flag (e.g., generate doesn't)
        # Only add --yes for commands that typically need confirmation (like sync, change, etc.)
        commands_that_support_yes = ['sync', 'change', 'split', 'preprocess']
        command_name = command[1] if len(command) > 1 else None
        has_yes_flag = any(arg in ['--yes', '-y'] for arg in command)
        if command_name in commands_that_support_yes and not has_yes_flag:
            command.append('--yes')
            logger.info(f"Added --yes flag for {command_name} command")
        
        # Execute the pdd command
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False,  # Don't raise exception on non-zero exit
            timeout=PDD_COMMAND_TIMEOUT,
            env=env,  # Pass environment variables to pdd
            cwd=working_dir  # Set working directory to server directory
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown error occurred"
            logger.error(f"{description} failed: {error_msg}")
            return "", False, error_msg
        
        output = result.stdout.strip()
        logger.info(f"{description} completed successfully")
        return output, True, None
        
    except subprocess.TimeoutExpired:
        error_msg = f"{description} timed out after {PDD_COMMAND_TIMEOUT} seconds"
        logger.error(error_msg)
        return "", False, error_msg
    except Exception as e:
        error_msg = f"Error executing {description}: {str(e)}"
        logger.error(error_msg)
        return "", False, error_msg


def get_pdd_commands_info() -> List[PDDCommandInfo]:
    """
    Get information about all available PDD commands.
    
    Returns:
        List of PDDCommandInfo objects containing command details
    """
    commands = [
        PDDCommandInfo(
            name="sync",
            description="[PRIMARY COMMAND] Automatically executes the complete PDD workflow loop for a given basename - from dependency injection through code generation, testing, and verification.",
            usage="pdd sync -b <basename>"
        ),
        PDDCommandInfo(
            name="generate",
            description="Creates runnable code from a prompt file; supports parameterized prompts via -e/--env.",
            usage="pdd generate -p <prompt_file> or pdd generate -b <basename>"
        ),
        PDDCommandInfo(
            name="example",
            description="Generates a compact example showing how to use functionality defined in a prompt.",
            usage="pdd example -b <basename>"
        ),
        PDDCommandInfo(
            name="test",
            description="Generates or enhances unit tests for a code file and its prompt.",
            usage="pdd test -b <basename>"
        ),
        PDDCommandInfo(
            name="preprocess",
            description="Preprocesses prompt files, handling includes, comments, and other directives.",
            usage="pdd preprocess -p <prompt_file>"
        ),
        PDDCommandInfo(
            name="fix",
            description="Fixes errors in code and unit tests based on error messages and the original prompt.",
            usage="pdd fix -b <basename>"
        ),
        PDDCommandInfo(
            name="split",
            description="Splits large prompt files into smaller, more manageable ones.",
            usage="pdd split -p <prompt_file>"
        ),
        PDDCommandInfo(
            name="change",
            description="Modifies a prompt file based on instructions in a change prompt.",
            usage="pdd change -b <basename>"
        ),
        PDDCommandInfo(
            name="update",
            description="Updates the original prompt file based on modified code.",
            usage="pdd update -b <basename>"
        ),
        PDDCommandInfo(
            name="detect",
            description="Analyzes prompts to determine which ones need changes based on a description.",
            usage="pdd detect -b <basename>"
        ),
        PDDCommandInfo(
            name="conflicts",
            description="Finds and suggests resolutions for conflicts between two prompt files.",
            usage="pdd conflicts -b <basename1> -b <basename2>"
        ),
        PDDCommandInfo(
            name="crash",
            description="Fixes errors in a code module and its calling program that caused a crash. Includes an agentic fallback mode for complex errors.",
            usage="pdd crash -b <basename>"
        ),
        PDDCommandInfo(
            name="trace",
            description="Finds the corresponding line number in a prompt file for a given code line.",
            usage="pdd trace -b <basename>"
        ),
        PDDCommandInfo(
            name="bug",
            description="Generates a unit test based on observed vs. desired program outputs.",
            usage="pdd bug -b <basename>"
        ),
        PDDCommandInfo(
            name="auto-deps",
            description="Analyzes and inserts needed dependencies into a prompt file.",
            usage="pdd auto-deps -b <basename>"
        ),
        PDDCommandInfo(
            name="verify",
            description="Verifies functional correctness by running a program and judging its output against the prompt's intent using an LLM.",
            usage="pdd verify -b <basename>"
        ),
    ]
    
    return commands

