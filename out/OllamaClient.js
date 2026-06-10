"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
const http = require("http");
const https = require("https");
const url_1 = require("url");
class OllamaClient {
    async listModels(endpoint) {
        return new Promise((resolve, reject) => {
            try {
                const apiUrl = new url_1.URL('/api/tags', endpoint);
                const requestModule = apiUrl.protocol === 'https:' ? https : http;
                const req = requestModule.get(apiUrl, (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`Ollama API error: ${res.statusCode}`));
                        return;
                    }
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.models && Array.isArray(parsed.models)) {
                                const models = parsed.models.map((m) => m.name);
                                resolve(models);
                            }
                            else {
                                resolve([]);
                            }
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
                req.on('error', (e) => {
                    reject(e);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
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