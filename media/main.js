const vscode = acquireVsCodeApi();

const chatHistory = document.getElementById("chat-history");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

let currentMessageElement = null;
let currentMessageContent = "";

function appendMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role === "user" ? "user-message" : "system-message"}`;
  messageDiv.textContent = content;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return messageDiv;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";
  
  currentMessageElement = appendMessage("system", "");
  currentMessageContent = "";

  vscode.postMessage({
    type: "askOllama",
    value: text,
  });
}

sendButton.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.type) {
    case "streamResponse":
      if (currentMessageElement) {
        currentMessageContent += message.value;
        currentMessageElement.textContent = currentMessageContent;
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
      break;
    case "streamDone":
      currentMessageElement = null;
      break;
    case "streamError":
      if (currentMessageElement) {
        currentMessageElement.textContent += `\n\n[Error: ${message.value}]`;
        currentMessageElement.style.borderColor = "red";
      }
      currentMessageElement = null;
      break;
  }
});
