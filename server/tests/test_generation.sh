#!/bin/bash
# Test: Generation (LLM + post-processing + Mermaid HTML)

echo "============================================================"
echo "Test: Generation (LLM + post-processing + Mermaid HTML)"
echo "============================================================"
echo ""

echo "Command to test:"
echo "pdd generate --template architecture/architecture_json \\"
echo "  -e PRD_FILE=tests/specs.md \\"
echo "  -e APP_NAME=\"MyApp\" \\"
echo "  --output architecture.json"
echo ""

echo "API Request:"
echo "POST http://localhost:8000/execute"
echo ""

curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command": "generate",
    "args": {
      "--template": "architecture/architecture_json",
      "-e": ["PRD_FILE=tests/specs.md", "APP_NAME=MyApp"],
      "--output": "architecture.json"
    }
  }' | python3 -m json.tool

echo ""
echo "============================================================"
echo "Test completed!"
echo "============================================================"

