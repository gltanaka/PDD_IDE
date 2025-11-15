#!/bin/bash
# Script to set up API key for pdd

echo "============================================================"
echo "PDD API Key Setup"
echo "============================================================"
echo ""

# Check which API key to set
echo "Which API provider would you like to use?"
echo "1. Gemini (Google) - Recommended for free tier"
echo "2. OpenAI"
echo "3. Anthropic"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        read -p "Enter your GEMINI_API_KEY: " api_key
        export GEMINI_API_KEY="$api_key"
        echo "export GEMINI_API_KEY=\"$api_key\"" >> ~/.bashrc
        echo "export GEMINI_API_KEY=\"$api_key\"" >> ~/.zshrc 2>/dev/null || true
        echo ""
        echo "✅ GEMINI_API_KEY has been set and added to your shell config"
        ;;
    2)
        read -p "Enter your OPENAI_API_KEY: " api_key
        export OPENAI_API_KEY="$api_key"
        echo "export OPENAI_API_KEY=\"$api_key\"" >> ~/.bashrc
        echo "export OPENAI_API_KEY=\"$api_key\"" >> ~/.zshrc 2>/dev/null || true
        echo ""
        echo "✅ OPENAI_API_KEY has been set and added to your shell config"
        ;;
    3)
        read -p "Enter your ANTHROPIC_API_KEY: " api_key
        export ANTHROPIC_API_KEY="$api_key"
        echo "export ANTHROPIC_API_KEY=\"$api_key\"" >> ~/.bashrc
        echo "export ANTHROPIC_API_KEY=\"$api_key\"" >> ~/.zshrc 2>/dev/null || true
        echo ""
        echo "✅ ANTHROPIC_API_KEY has been set and added to your shell config"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "To use the API key in this session, run:"
echo "  source ~/.bashrc  # or source ~/.zshrc"
echo ""
echo "Or restart your terminal."
echo ""
echo "To test, run:"
echo "  cd server"
echo "  source venv_pdd/bin/activate"
echo "  pdd --version"

