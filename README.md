<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Prompt Driven Development IDE

This is a full-stack application with a React frontend and FastAPI server for Prompt Driven Development (PDD).

View your app in AI Studio: https://ai.studio/apps/drive/1VW91g87OjbxDm6yS-SWlZz117H9p19O9

## Project Structure

- **Frontend**: React + TypeScript + Vite (root directory)
- **Server**: FastAPI Python server (`server/` directory)

## Frontend Setup

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

## Server Setup

**Prerequisites:** Python 3.11 or 3.12, pdd CLI tool

See the [server README](server/README.md) for detailed setup instructions.

Quick start:

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python main.py
   ```

The server API will be available at `http://localhost:8000`

For more information, see [server/README.md](server/README.md)
