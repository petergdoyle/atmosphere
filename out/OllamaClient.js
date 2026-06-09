"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
const http = require("http");
const https = require("https");
const url_1 = require("url");
class OllamaClient {
    async generateStream(options, onToken) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = new url_1.URL('/api/generate', options.endpoint);
                const requestModule = apiUrl.protocol === 'https:' ? https : http;
                const reqOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                const req = requestModule.request(apiUrl, reqOptions, (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`Ollama API error: ${res.statusCode}`));
                        return;
                    }
                    res.on('data', (chunk) => {
                        const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');
                        for (const line of lines) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.response) {
                                    onToken(parsed.response);
                                }
                                if (parsed.done) {
                                    resolve();
                                }
                            }
                            catch (e) {
                                console.error('Error parsing Ollama chunk:', e);
                            }
                        }
                    });
                    res.on('end', () => {
                        resolve();
                    });
                });
                req.on('error', (e) => {
                    reject(e);
                });
                const body = JSON.stringify({
                    model: options.model,
                    prompt: options.prompt,
                    system: options.system,
                    stream: true
                });
                req.write(body);
                req.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.OllamaClient = OllamaClient;
//# sourceMappingURL=OllamaClient.js.map