"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = require("vscode");
const OllamaClient_1 = require("./OllamaClient");
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._ollamaClient = new OllamaClient_1.OllamaClient();
    }
    postMessageToWebview(message) {
        if (this._view) {
            this._view.show?.(true);
            this._view.webview.postMessage(message);
        }
        else {
            this._pendingMessage = message;
        }
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        if (this._pendingMessage) {
            setTimeout(() => {
                this._view?.webview.postMessage(this._pendingMessage);
                this._pendingMessage = undefined;
            }, 200);
        }
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "askOllama": {
                    if (!data.value) {
                        return;
                    }
                    const config = vscode.workspace.getConfiguration("atmosphere");
                    const endpoint = config.get("ollamaEndpoint") || "http://localhost:11434";
                    const model = config.get("model") || "deepseek-coder";
                    // Gather context
                    const editor = vscode.window.activeTextEditor;
                    let contextText = "";
                    if (editor) {
                        const selection = editor.selection;
                        if (!selection.isEmpty) {
                            contextText = `Selected code:\n\`\`\`\n${editor.document.getText(selection)}\n\`\`\`\n\n`;
                        }
                        else {
                            contextText = `Current file (${editor.document.fileName}):\n\`\`\`\n${editor.document.getText()}\n\`\`\`\n\n`;
                        }
                    }
                    const prompt = `${contextText}User Query: ${data.value}`;
                    try {
                        await this._ollamaClient.generateStream({
                            endpoint,
                            model,
                            prompt,
                            system: "You are Atmosphere, a highly capable AI coding assistant. Provide concise, expert-level coding advice."
                        }, (token) => {
                            this._view?.webview.postMessage({ type: "streamResponse", value: token });
                        });
                        this._view?.webview.postMessage({ type: "streamDone" });
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Atmosphere Error: ${err.message}`);
                        this._view?.webview.postMessage({ type: "streamError", value: err.message });
                    }
                    break;
                }
                case "getModels": {
                    const config = vscode.workspace.getConfiguration("atmosphere");
                    const endpoint = config.get("ollamaEndpoint") || "http://localhost:11434";
                    const currentModel = config.get("model") || "deepseek-coder";
                    try {
                        const models = await this._ollamaClient.listModels(endpoint);
                        this._view?.webview.postMessage({ type: "modelsList", value: models, current: currentModel });
                    }
                    catch (err) {
                        this._view?.webview.postMessage({ type: "modelsError", value: err.message });
                    }
                    break;
                }
                case "selectModel": {
                    if (data.value) {
                        const config = vscode.workspace.getConfiguration("atmosphere");
                        await config.update("model", data.value, vscode.ConfigurationTarget.Global);
                    }
                    break;
                }
            }
        });
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "style.css"));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
				<title>Atmosphere</title>
			</head>
			<body>
        <div class="chat-container">
          <div class="chat-header">
            <div class="connection-status">
              <span class="status-dot offline" id="status-dot"></span>
              <span class="status-text" id="status-text">Connecting...</span>
            </div>
            <select id="model-select" class="model-select">
              <option value="">Loading models...</option>
            </select>
          </div>
          <div id="chat-history">
            <div class="message system-message">
              <div class="logo-container">
                 <div class="atmosphere-orbit"></div>
                 <div class="atmosphere-core"></div>
              </div>
              <p>Atmosphere initialized. Code at a higher altitude.</p>
            </div>
          </div>
          <div class="input-container">
            <textarea id="chat-input" placeholder="Ask Atmosphere..."></textarea>
            <button id="send-button">Send</button>
          </div>
        </div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=SidebarProvider.js.map