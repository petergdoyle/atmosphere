const vscode = acquireVsCodeApi();

const chatHistory = document.getElementById("chat-history");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const modelSelect = document.getElementById("model-select");

let currentMessageElement = null;
let currentMessageContent = "";

// Initialize chat history from state if available
const savedState = vscode.getState();
if (savedState && savedState.history && savedState.history.length > 0) {
  chatHistory.innerHTML = "";
  savedState.history.forEach(msg => {
    appendMessage(msg.role, msg.content, false);
  });
}

// Request models list on load
vscode.postMessage({ type: "getModels" });

// Handle model selection change
modelSelect.addEventListener("change", () => {
  vscode.postMessage({
    type: "selectModel",
    value: modelSelect.value
  });
});

function parseMarkdown(text) {
  const codeBlocks = [];
  // Escape HTML to prevent XSS
  let safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Extract code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  safeText = safeText.replace(codeBlockRegex, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang: lang || 'code', code: code.trim() });
    return `__CODE_BLOCK_${index}__`;
  });

  const lines = safeText.split('\n');
  let parsedLines = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Check if it's a code block placeholder
    if (trimmed.startsWith('__CODE_BLOCK_') && trimmed.endsWith('__')) {
      if (inList) {
        parsedLines.push('</ul>');
        inList = false;
      }
      parsedLines.push(line);
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      if (inList) { parsedLines.push('</ul>'); inList = false; }
      parsedLines.push(`<h3>${trimmed.substring(4)}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { parsedLines.push('</ul>'); inList = false; }
      parsedLines.push(`<h2>${trimmed.substring(3)}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { parsedLines.push('</ul>'); inList = false; }
      parsedLines.push(`<h1>${trimmed.substring(2)}</h1>`);
      continue;
    }

    // Unordered List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        parsedLines.push('<ul>');
        inList = true;
      }
      const itemContent = parseInline(trimmed.substring(2));
      parsedLines.push(`<li>${itemContent}</li>`);
      continue;
    }

    // Ordered List Items
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inList) { parsedLines.push('</ul>'); inList = false; }
      const itemContent = parseInline(olMatch[2]);
      parsedLines.push(`<div class="ol-item"><span class="ol-num">${olMatch[1]}.</span> ${itemContent}</div>`);
      continue;
    }

    // Empty line
    if (trimmed === '') {
      if (inList) {
        parsedLines.push('</ul>');
        inList = false;
      }
      parsedLines.push('<br/>');
      continue;
    }

    // Regular paragraph line
    if (inList) {
      parsedLines.push('</ul>');
      inList = false;
    }
    parsedLines.push(`<p>${parseInline(line)}</p>`);
  }

  if (inList) {
    parsedLines.push('</ul>');
  }

  let finalHtml = parsedLines.join('\n');

  // Re-insert code blocks
  for (let j = 0; j < codeBlocks.length; j++) {
    const block = codeBlocks[j];
    const codeHtml = `<div class="code-block-container">
      <div class="code-block-header">
        <span class="code-block-lang">${block.lang}</span>
        <button class="copy-code-btn" onclick="copyToClipboard(this)">Copy</button>
      </div>
      <pre><code class="language-${block.lang}">${block.code}</code></pre>
    </div>`;
    finalHtml = finalHtml.replace(`__CODE_BLOCK_${j}__`, codeHtml);
  }

  return finalHtml;
}

function parseInline(text) {
  let html = text;
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return html;
}

window.copyToClipboard = function(button) {
  const container = button.closest('.code-block-container');
  const codeElement = container.querySelector('code');
  if (codeElement) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = codeElement.innerHTML;
    const codeText = textarea.value;
    
    navigator.clipboard.writeText(codeText).then(() => {
      button.textContent = "Copied!";
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = "Copy";
        button.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
};

function appendMessage(role, content, saveToState = true) {
  if (role === "user" && chatHistory.querySelector(".logo-container")) {
    chatHistory.innerHTML = "";
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role === "user" ? "user-message" : "system-message"}`;
  
  if (role === "user") {
    messageDiv.innerHTML = parseMarkdown(content);
  } else {
    messageDiv.innerHTML = parseMarkdown(content);
  }
  
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  if (saveToState) {
    let state = vscode.getState() || { history: [] };
    state.history.push({ role, content });
    vscode.setState(state);
  }
  return messageDiv;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";
  
  currentMessageElement = appendMessage("system", "", false);
  currentMessageContent = "";

  vscode.postMessage({
    type: "askOllama",
    value: text,
  });
}

sendButton.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.type) {
    case "modelsList": {
      statusDot.className = "status-dot online";
      statusText.textContent = "Online";
      
      modelSelect.innerHTML = "";
      if (message.value.length === 0) {
        modelSelect.innerHTML = '<option value="">No models found</option>';
      } else {
        message.value.forEach(model => {
          const option = document.createElement("option");
          option.value = model;
          option.textContent = model;
          if (model === message.current) {
            option.selected = true;
          }
          modelSelect.appendChild(option);
        });
      }
      break;
    }
    case "modelsError": {
      statusDot.className = "status-dot offline";
      statusText.textContent = "Offline";
      modelSelect.innerHTML = '<option value="">Offline</option>';
      break;
    }
    case "editorCommand": {
      let prompt = "";
      if (message.command === "explain") {
        prompt = `Explain the following code:\n\`\`\`\n${message.code}\n\`\`\``;
      } else if (message.command === "fix") {
        prompt = `Analyze the following code, find any bugs or issues, and provide a corrected version:\n\`\`\`\n${message.code}\n\`\`\``;
      } else if (message.command === "generateTests") {
        prompt = `Generate comprehensive unit tests for the following code:\n\`\`\`\n${message.code}\n\`\`\``;
      }

      appendMessage("user", prompt);
      
      currentMessageElement = appendMessage("system", "", false);
      currentMessageContent = "";

      vscode.postMessage({
        type: "askOllama",
        value: prompt
      });
      break;
    }
    case "streamResponse":
      if (currentMessageElement) {
        currentMessageContent += message.value;
        currentMessageElement.innerHTML = parseMarkdown(currentMessageContent);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
      break;
    case "streamDone":
      if (currentMessageElement) {
        let state = vscode.getState() || { history: [] };
        state.history.push({ role: "system", content: currentMessageContent });
        vscode.setState(state);
      }
      currentMessageElement = null;
      break;
    case "streamError":
      if (currentMessageElement) {
        currentMessageContent += `\n\n[Error: ${message.value}]`;
        currentMessageElement.innerHTML = parseMarkdown(currentMessageContent);
        currentMessageElement.style.borderColor = "red";
        
        let state = vscode.getState() || { history: [] };
        state.history.push({ role: "system", content: currentMessageContent });
        vscode.setState(state);
      }
      currentMessageElement = null;
      break;
  }
});
