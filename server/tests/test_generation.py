#!/usr/bin/env python3
"""
Test: Generation (LLM + post-processing + Mermaid HTML)
Tests the complete generation workflow with template and environment variables.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json

BASE_URL = "http://localhost:8000"


def test_full_generation():
    """Test full generation command with template and environment variables."""
    
    print("=" * 60)
    print("Test: Generation (LLM + post-processing + Mermaid HTML)")
    print("=" * 60)
    print("")
    
    print("Command to test:")
    print("pdd generate --template architecture/architecture_json \\")
    print("  -e PRD_FILE=tests/specs.md \\")
    print("  -e APP_NAME=\"MyApp\" \\")
    print("  --output architecture.json")
    print("")
    
    # Prepare the request
    payload = {
        "command": "generate",
        "args": {
            "--template": "architecture/architecture_json",
            "-e": ["PRD_FILE=tests/specs.md", "APP_NAME=MyApp"],
            "--output": "architecture.json"
        }
    }
    
    print("API Request:")
    print(f"POST {BASE_URL}/execute")
    print(json.dumps(payload, indent=2))
    print("")
    
    # Make the request
    try:
        response = requests.post(
            f"{BASE_URL}/execute",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=300  # 5 minutes timeout for LLM generation
        )
        
        print(f"Response Status: {response.status_code}")
        result = response.json()
        
        print("")
        print("Response:")
        if result.get("success"):
            print("✅ Success: True")
            output = result.get("output", "")
            if output:
                print(f"✅ Output length: {len(output)} characters")
                print("")
                print("Output preview (first 500 chars):")
                print("-" * 60)
                print(output[:500])
                print("-" * 60)
            else:
                print("⚠️  No output returned")
        else:
            print("❌ Success: False")
            error = result.get("error", "Unknown error")
            print(f"❌ Error: {error[:200]}")
        
        return result
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server. Is it running?")
        return None
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None


if __name__ == "__main__":
    print("\n🚀 Starting Full Generation Test\n")
    result = test_full_generation()
    
    print("")
    print("=" * 60)
    if result and result.get("success"):
        print("✅ Test completed successfully!")
    else:
        print("⚠️  Test completed with issues")
    print("=" * 60)

