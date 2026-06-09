# Atmosphere Architecture

## Overview
Atmosphere is a standard VS Code extension that operates entirely locally. It acts as the frontend interface for a self-hosted AI backend.

## Components

### 1. The Extension Host (`src/extension.ts`)
The main entry point of the extension. It runs in Node.js and has access to the full VS Code API.
- Registers commands.
- Registers the Activity Bar icon and the Webview container.

### 2. The Sidebar Webview (`src/SidebarProvider.ts` & `media/`)
The user interface is hosted inside a VS Code Webview.
- **Frontend Logic (`media/main.js`)**: Captures user input, renders chat bubbles, and processes incoming stream tokens to update the UI in real-time.
- **Styling (`media/style.css`)**: Custom vanilla CSS implementing the "Deep Space" aesthetic with slate blues and neon cyan accents.
- **Message Passing**: Uses `postMessage` to communicate securely between the Webview context (HTML/JS) and the Extension Host (Node.js).

### 3. Context Gathering
When the user sends a message from the Webview, the Extension Host intercepts it and gathers context from the editor:
- Reads `vscode.window.activeTextEditor`.
- Extracts highlighted text (`editor.selection`) or the entire file content if nothing is selected.
- Appends this context to the user's prompt.

### 4. The Ollama Client (`src/OllamaClient.ts`)
A lightweight, dependency-free HTTP client built on Node's native `http`/`https` modules.
- Sends POST requests to the `/api/generate` endpoint of the configured Ollama server.
- Uses `chunk.toString().split('\n')` to parse NDJSON (Newline Delimited JSON) streams.
- Emits tokens back to the Webview as soon as they are received over the network.

## Target Infrastructure
The expected backend is a Proxmox LXC container running Docker. The Docker compose stack hosts the Ollama API layer, making it accessible over the local homelab network.
