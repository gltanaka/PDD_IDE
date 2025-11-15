# Frontend API Endpoints

## Basic Endpoints

### Health Check
- **GET** `/api`
- **Description**: Check if the backend service is running
- **Response**:
```json
{
  "message": "PDD Backend API is running",
  "version": "1.0.0"
}
```

---

## Build Endpoints

Build endpoints are used in the Builder view for constructing and executing PDD commands.

### 1. Get All Commands
- **GET** `/commands`
- **Description**: Get all available PDD command list
- **Response**:
```json
{
  "commands": [
    {
      "name": "generate",
      "description": "Creates runnable code from a prompt file...",
      "usage": "pdd generate -p <prompt_file> or pdd generate -b <basename>"
    },
    ...
  ],
  "total": 16
}
```

### 2. Execute Command (Universal Endpoint)
- **POST** `/execute`
- **Description**: Execute any PDD CLI command
- **Request Body**:
```json
{
  "command": "generate",  // Command name (from /commands)
  "prompt": "prompts/common/react-setup.prompt",  // Optional: file path or content
  "basename": "optional_basename",  // Optional
  "args": {  // Optional: additional arguments
    "-e": "PRD_FILE=docs/specs.md",
    "--output-file": "architecture.json"
  }
}
```

- **Response**:
```json
{
  "output": "Command execution output (YAML formatted string)",
  "success": true,
  "error": null
}
```

- **Error Response**:
```json
{
  "output": "",
  "success": false,
  "error": "Error message"
}
```

### Command Name Mapping

Mapping from frontend `CommandType` to backend command names:

| Frontend CommandType | Backend Command Name | Description |
|---------------------|---------------------|-------------|
| `GEN` | `generate` | Generate code |
| `EXAMPLE` | `example` | Generate example |
| `TEST` | `test` | Generate test |
| `FIX` | `fix` | Fix errors |
| `VERIFY` | `verify` | Verify functionality |
| `CRASH` | `fix` | Fix crash (uses fix command) |
| `SCAFFOLD` | `generate` | Create project (uses generate) |
| `REVIEW` | `generate` | Code review (uses generate) |
| `COMMIT` | `generate` | Generate commit message (uses generate) |

---

## Graph Endpoints

Graph endpoints are used in the Graph/Dependencies view for viewing and managing prompt files, code, examples, and tests.

### 3. Execute Command from Graph View
- **POST** `/execute`
- **Description**: Execute PDD commands from the Graph view (Update, Generate, Create Example, Verify, Fix, etc.)
- **Request Body**:
```json
{
  "command": "generate",  // Command name: "generate", "example", "test", "fix", "verify"
  "prompt": "prompts/common/react-setup.prompt"  // File path to the prompt file
}
```

- **Response**: Same as Build Endpoints `/execute`
- **Usage in Graph View**:
  - **Update** button (Prompt tab): `command: "generate"` with prompt file path
  - **Generate** button (Code tab): `command: "generate"` with prompt file path
  - **Create Example** button (Example tab): `command: "example"` with prompt file path
  - **Verify** button (Example tab): `command: "verify"` with prompt file path
  - **Fix Crash** button (Example tab): `command: "fix"` with prompt file path
  - **Generate Test** button (Test tab): `command: "test"` with prompt file path
  - **Fix Test** button (Test tab): `command: "fix"` with prompt file path

### 4. Get File
- **GET** `/files?path=<file_path>`
- **Description**: Read file content from the server
- **Query Parameters**:
  - `path`: File path (relative to server directory)
- **Response**:
```json
{
  "content": "File content",
  "success": true,
  "error": null
}
```

- **Error Response**:
```json
{
  "content": "",
  "success": false,
  "error": "File not found: <path>"
}
```

### 5. Save File
- **POST** `/files`
- **Description**: Save file content to the server
- **Request Body**:
```json
{
  "path": "prompts/common/react-setup.prompt",
    "content": "File content..."
}
```

- **Response**:
```json
{
  "output": "File saved successfully: <path>",
  "success": true,
  "error": null
}
```

---

## Usage Examples

### Build Examples

#### Example 1: Execute generate command (using file path)
```javascript
fetch('/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'generate',
    prompt: 'prompts/common/react-setup.prompt'
  })
})
```

#### Example 2: Execute generate command (with additional arguments)
```javascript
fetch('/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'generate',
    prompt: 'pdd/templates/architecture/architecture_json.prompt',
    args: {
      '--output-file': 'architecture.json',
      '-e': 'PRD_FILE=docs/specs.md'
    }
  })
})
```

### Graph Examples

#### Example 3: Execute command from Graph view (Update/Generate)
```javascript
// Update button in Prompt tab
fetch('/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'generate',
    prompt: 'prompts/common/react-setup.prompt'
  })
})

// Generate Test button in Test tab
fetch('/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'test',
    prompt: 'prompts/common/react-setup.prompt'
  })
})
```

#### Example 4: Read file
```javascript
fetch('/files?path=prompts/common/react-setup.prompt')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log(data.content);
    }
  });
```

#### Example 5: Save file
```javascript
fetch('/files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'prompts/common/react-setup.prompt',
    content: '# Instruction\nCreate a React component...'
  })
})
```

## Notes

1. **File Paths**: 
   - If the `prompt` field contains `/` or ends with `.prompt`, the backend will treat it as a file path
   - File paths are relative to the `server/` directory
   - Example: `prompts/common/react-setup.prompt` corresponds to `server/prompts/common/react-setup.prompt`

2. **Command Execution**:
   - All commands are executed in the `server/` directory
   - Generated files will be saved in the `server/` directory

3. **Error Handling**:
   - All endpoints return a unified response format
   - Check the `success` field to determine if the operation was successful
   - Error messages are in the `error` field

