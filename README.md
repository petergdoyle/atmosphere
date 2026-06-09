# Atmosphere IDE Extension

The **Atmosphere** VS Code extension is a modern, lightweight AI IDE extension designed to connect to your homelab Ollama instance.

Code at a higher altitude.
The lightweight IDE with local intelligence.
Intelligent coding, built on open space.

## What Was Built

### Core Extension Scaffolding
- Set up a clean TypeScript project with `@types/vscode`.
- Created the extension manifest (`package.json`) registering the Atmosphere sidebar and commands.

### Aesthetic & UI (Sidebar Webview)
- Implemented a custom `SidebarProvider` to render an HTML Webview directly inside the VS Code sidebar.
- Styled the UI according to the aesthetic requirements:
  - Deep slate blue backgrounds (`#0f172a`).
  - Cool gray text (`#e2e8f0`).
  - Neon cyan accents (`#06b6d4`).
- Designed a custom SVG logo representing the minimalist gradient-filled core with a broken orbit line.
- Included a dynamic chat interface with custom Markdown formatting for code blocks.

### Ollama API Integration
- Built a native `OllamaClient` using Node's `http/https` modules to communicate with `/api/generate`.
- Implemented streaming capabilities. As your homelab Ollama instance generates tokens, they stream smoothly into the VS Code chat interface without waiting for the full response.

### VS Code Editor Context
- When you send a message, the extension automatically grabs the currently active file or your highlighted text selection, so you don't have to copy-paste code to the AI.

### Configuration Settings
- Added standard VS Code settings for you to configure:
  - `atmosphere.ollamaEndpoint` (Defaults to `http://localhost:11434`)
  - `atmosphere.model` (A dropdown to select `deepseek-coder`, `codellama`, or `llama3`)

## How to Test

You can now test the extension directly in your environment:

1. Open VS Code in the project directory.
2. Press **F5** (or go to the Run and Debug panel and click "Run Extension"). This will open a new "Extension Development Host" window.
3. In the new window, click the new **Atmosphere logo** in your activity bar (the left sidebar).
4. Go to VS Code settings (`Cmd+,`) and search for "Atmosphere". Ensure the Ollama Endpoint URL points exactly to your Proxmox LXC container running the Ollama API.
5. Open any code file, highlight some code, and type a question into the Atmosphere chat panel!

> **Note:** If your homelab container is running on a different IP (e.g., `http://192.168.1.50:11434`), make sure to update the VS Code setting before sending a prompt!
