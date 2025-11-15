# PDD Backend Server

A FastAPI backend server that wraps the [pdd](https://github.com/promptdriven/pdd) (Prompt Driven Development) CLI tool. This backend provides REST API endpoints for generating code and syncing prompts.

## Features

- **Generate Feature**: Creates runnable code from a prompt using `pdd generate`
- **Revise Feature**: Executes the complete PDD workflow loop using `pdd sync`
- RESTful API with proper error handling
- CORS enabled for frontend communication

## Prerequisites

1. **Python 3.11 or 3.12** installed on your system (required for pdd-cli)
2. **pdd CLI tool** installed and available
   - Follow the installation instructions at: https://github.com/promptdriven/pdd
   - Installation: `pip install pdd-cli` (requires Python 3.11/3.12)
   - Verify installation by running: `pdd --version`
   - **Note**: This project includes a Python 3.12 virtual environment (`venv_pdd`) with pdd-cli pre-installed

## Project Structure

```
backend/
├── app/              # Main application package
│   ├── main.py      # FastAPI app initialization
│   ├── models.py    # Request/response models
│   ├── routes.py    # API endpoints
│   ├── services.py  # Business logic
│   └── config.py    # Configuration
├── deployment/       # Deployment files (Docker, systemd, etc.)
├── tests/           # Test files
└── main.py          # Entry point
```

## Installation

1. **Clone or navigate to this directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment for backend (Python 3.8+):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **pdd CLI is already installed** in `venv_pdd` (Python 3.12)
   - If you need to reinstall: `cd venv_pdd && pip install pdd-cli`
   - The backend automatically uses the pdd from `venv_pdd/bin/pdd`

5. **Configure pdd (required for LLM features):**
   ```bash
   source venv_pdd/bin/activate
   pdd setup
   ```
   This will guide you through API key configuration.

## Running the Server

### Quick Setup (Automated)

Use the deployment script for easy setup:

```bash
./deployment/deploy.sh
source venv/bin/activate
python main.py
```

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## VM Deployment

### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   cd deployment
   docker-compose up -d
   ```

2. **Or build and run manually:**
   ```bash
   docker build -f deployment/Dockerfile -t pdd-backend .
   docker run -d -p 8000:8000 --name pdd-backend pdd-backend
   ```

3. **Note:** Ensure the `pdd` CLI tool is available inside the container. You may need to:
   - Install pdd in the Dockerfile, or
   - Mount the pdd binary as a volume (see docker-compose.yml)

### Option 2: Systemd Service (Linux VM)

1. **Copy the service file to systemd directory:**
   ```bash
   sudo cp deployment/pdd-backend.service /etc/systemd/system/
   ```

2. **Edit the service file to match your paths:**
   ```bash
   sudo nano /etc/systemd/system/pdd-backend.service
   ```
   Update `WorkingDirectory` and `ExecStart` paths as needed.

3. **Enable and start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable pdd-backend
   sudo systemctl start pdd-backend
   ```

4. **Check status:**
   ```bash
   sudo systemctl status pdd-backend
   ```

5. **View logs:**
   ```bash
   sudo journalctl -u pdd-backend -f
   ```

### Option 3: Direct VM Installation

1. **SSH into your VM and clone/copy the project:**
   ```bash
   cd /opt
   # Copy your backend directory here
   ```

2. **Run the deployment script:**
   ```bash
   cd /opt/backend
   ./deployment/deploy.sh
   ```

3. **Run the server:**
   ```bash
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

4. **For persistent running, use a process manager like PM2 or screen:**
   ```bash
   # Using screen
   screen -S pdd-backend
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   # Press Ctrl+A then D to detach
   ```

## API Endpoints

### Health Check

**GET** `/`

Returns server status and version.

**Response:**
```json
{
  "message": "PDD Backend API is running",
  "version": "1.0.0"
}
```

### Get All Commands

**GET** `/commands`

Returns all available PDD CLI commands stored in the backend. All 16 commands are stored here and can be retrieved by the frontend.

**Response:**
```json
{
  "commands": [
    {
      "name": "sync",
      "description": "[PRIMARY COMMAND] Automatically executes...",
      "usage": "pdd sync -b <basename>"
    },
    ...
  ],
  "total": 16
}
```

**Example:**
```bash
curl "http://localhost:8000/commands"
```

### Execute Command (Universal Endpoint)

**POST** `/execute`

Universal endpoint to execute any PDD CLI command. All CLI commands are stored in the backend and executed through this single endpoint based on user requests.

**Request Body:**
```json
{
  "command": "generate",  // Command name from /commands
  "prompt": "Your prompt text here",  // Optional
  "basename": "optional_basename",  // Optional
  "args": {  // Optional additional arguments
    "-e": "env_value"
  }
}
```

**Response:**
```json
{
  "output": "YAML formatted output string",
  "success": true,
  "error": null
}
```

**Examples:**

Execute generate command:
```bash
curl -X POST "http://localhost:8000/execute" \
  -H "Content-Type: application/json" \
  -d '{"command": "generate", "prompt": "Create a function that adds two numbers"}'
```

Execute sync command:
```bash
curl -X POST "http://localhost:8000/execute" \
  -H "Content-Type: application/json" \
  -d '{"command": "sync", "basename": "my_prompt"}'
```

Execute any other command:
```bash
curl -X POST "http://localhost:8000/execute" \
  -H "Content-Type: application/json" \
  -d '{"command": "test", "basename": "my_prompt"}'
```

## Error Handling

All endpoints return a consistent error format:

```json
{
  "output": "",
  "success": false,
  "error": "Error message describing what went wrong"
}
```

HTTP status codes:
- `200`: Success
- `500`: Server error (pdd command failed or internal error)

## Configuration

### CORS Settings

By default, CORS is configured to allow all origins (`allow_origins=["*"]`). For production, update the CORS configuration in `main.py` to restrict access to your specific frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Timeout Settings

The default timeout for pdd commands is 5 minutes (300 seconds). You can adjust this in the `execute_pdd_command` function in `main.py`.

## Troubleshooting

1. **pdd command not found:**
   - Ensure pdd is installed and available in your PATH
   - Verify with: `which pdd` (Linux/Mac) or `where pdd` (Windows)

2. **Port already in use:**
   - Change the port in `main.py` or use: `uvicorn main:app --port 8001`

3. **Permission errors:**
   - Ensure the user running the server has permission to execute pdd commands
   - Check file permissions for temporary files

## Development

The codebase is structured with:
- Clear separation of concerns
- Comprehensive error handling
- Logging for debugging
- Type hints for better code clarity

## License

This backend server is provided as-is for use with the pdd tool.

