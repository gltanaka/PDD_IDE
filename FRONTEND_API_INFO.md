# Frontend API Information

## API Base URL

All API endpoints are available at: `http://localhost:8000`

Since the frontend and backend run on the same port (8000), you can use relative paths:
- `/api` - Health check
- `/commands` - Get all commands
- `/execute` - Execute commands
- `/files` - File operations (GET and POST)

## Available Endpoints

### Build Endpoints (for Builder view)

#### 1. Get All Commands
- **GET** `/commands`
- Returns list of all available PDD commands

#### 2. Execute Command
- **POST** `/execute`
- **Request Body:**
```json
{
  "command": "generate",
  "prompt": "prompt content or file path",
  "basename": "optional",
  "args": {
    "-e": "PRD_FILE=docs/specs.md",
    "--output-file": "path/to/file"
  }
}
```

### Graph Endpoints (for Graph/Dependencies view)

#### 3. Execute Command from Graph View
- **POST** `/execute`
- Same endpoint as Build, but used differently:
  - Pass **prompt content** (not file path) in the `prompt` field
  - PRD and graph files are automatically determined by the backend
  - Backend will automatically use `docs/specs.md` as PRD file

**Button Mappings:**
- **Update** (Prompt tab) → `command: "generate"` with prompt content
- **Generate** (Code tab) → `command: "generate"` with prompt content
- **Create Example** (Example tab) → `command: "example"` with prompt content
- **Verify** (Example tab) → `command: "verify"` with prompt content
- **Fix Crash** (Example tab) → `command: "fix"` with prompt content
- **Generate Test** (Test tab) → `command: "test"` with prompt content
- **Fix Test** (Test tab) → `command: "fix"` with prompt content

#### 4. Get File
- **GET** `/files?path=<file_path>`
- Read file content from server

#### 5. Save File
- **POST** `/files`
- **Request Body:**
```json
{
  "path": "path/to/file",
  "content": "file content"
}
```

## Important Notes

1. **Prompt Content vs File Path:**
   - For Graph view: Pass **prompt content** (string) in the `prompt` field
   - Backend will create a temporary file and automatically use PRD file
   - PRD file (`docs/specs.md`) is automatically added as environment variable

2. **File Storage:**
   - All generated files are stored in `/Users/bytedance/PDD_IDE/server/` directory
   - Working directory for pdd commands is `server/`

3. **Response Format:**
   - All endpoints return:
   ```json
   {
     "output": "result or output string",
     "success": true/false,
     "error": "error message or null"
   }
   ```

4. **Error Handling:**
   - Check `success` field to determine if operation succeeded
   - Error messages are in `error` field

## Example Usage

### Execute Generate from Graph View
```javascript
fetch('/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'generate',
    prompt: node.devUnit.prompt  // Pass prompt content, not file path
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Success:', data.output);
  } else {
    console.error('Error:', data.error);
  }
});
```

